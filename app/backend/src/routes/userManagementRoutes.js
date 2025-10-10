import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { logActions } from '../services/loggingService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create user endpoint
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      // Log access denied for duplicate user creation
      await logActions.accessDenied(req.user.id, 'failure', req, {
        resource: '/api/users/create',
        requiredRole: 'admin',
        userRole: req.user.role,
        reason: 'duplicate_user',
        attemptedUsername: username,
        attemptedEmail: email
      });
      
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Check if user has permission to create users
    if (req.user.role !== 'admin') {
      await logActions.accessDenied(req.user.id, 'failure', req, {
        resource: '/api/users/create',
        requiredRole: 'admin',
        userRole: req.user.role,
        reason: 'insufficient_permissions'
      });
      
      return res.status(403).json({ message: 'Only admins can create users' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    // Log successful user creation
    await logActions.userCreated(req.user.id, 'success', req, {
      targetUserId: user._id,
      targetUsername: username,
      targetEmail: email,
      targetRole: role,
      createdBy: req.user.username
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('User creation error:', error);
    
    // Log system error
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'USER_CREATION_ERROR',
      component: 'user_management',
      severity: 'high',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'User creation failed' });
  }
});

// Change password endpoint
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Get current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      // Log failed password change attempt
      await logActions.passwordChange(user._id, 'failure', req, {
        reason: 'invalid_current_password',
        attemptedBy: user.username
      });
      
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    user.password = hashedNewPassword;
    await user.save();

    // Log successful password change
    await logActions.passwordChange(user._id, 'success', req, {
      reason: 'user_initiated',
      passwordStrength: newPassword.length >= 12 ? 'strong' : 
                       newPassword.length >= 8 ? 'medium' : 'weak',
      changedBy: user.username
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    
    // Log system error
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'PASSWORD_CHANGE_ERROR',
      component: 'authentication',
      severity: 'medium',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'Password change failed' });
  }
});

// Update profile endpoint
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { email, username } = req.body;
    const allowedFields = ['email', 'username'];
    const updateData = {};
    const fieldsChanged = [];

    // Validate and prepare update data
    if (email && email !== req.user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      updateData.email = email;
      fieldsChanged.push('email');
    }

    if (username && username !== req.user.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updateData.username = username;
      fieldsChanged.push('username');
    }

    if (fieldsChanged.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log successful profile update
    await logActions.profileUpdate(user._id, 'success', req, {
      reason: 'user_initiated',
      fieldsChanged,
      updatedBy: user.username
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Log system error
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'PROFILE_UPDATE_ERROR',
      component: 'user_management',
      severity: 'medium',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'Profile update failed' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      await logActions.accessDenied(req.user.id, 'failure', req, {
        resource: '/api/users',
        requiredRole: 'admin',
        userRole: req.user.role,
        reason: 'insufficient_permissions'
      });
      
      return res.status(403).json({ message: 'Only admins can view all users' });
    }

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    // Log successful access
    await logActions.profileUpdate(req.user.id, 'success', req, {
      reason: 'admin_user_list_access',
      accessedBy: req.user.username
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'GET_USERS_ERROR',
      component: 'user_management',
      severity: 'medium',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Delete user endpoint (admin only)
router.delete('/users/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason = 'manual_deletion' } = req.body;

    if (req.user.role !== 'admin') {
      await logActions.accessDenied(req.user.id, 'failure', req, {
        resource: `/api/users/${userId}`,
        requiredRole: 'admin',
        userRole: req.user.role,
        reason: 'insufficient_permissions'
      });
      
      return res.status(403).json({ message: 'Only admins can delete users' });
    }

    // Prevent self-deletion
    if (userId === req.user.id) {
      await logActions.userDeleted(req.user.id, 'failure', req, {
        targetUserId: userId,
        targetUsername: req.user.username,
        deletedBy: req.user.username,
        deletionReason: 'self_deletion_attempt'
      });
      
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store user info for logging before deletion
    const userInfo = {
      targetUserId: userToDelete._id,
      targetUsername: userToDelete.username,
      targetEmail: userToDelete.email,
      targetRole: userToDelete.role
    };

    await User.findByIdAndDelete(userId);

    // Log successful user deletion
    await logActions.userDeleted(req.user.id, 'success', req, {
      ...userInfo,
      deletedBy: req.user.username,
      deletionReason: reason
    });

    res.json({
      message: 'User deleted successfully',
      deletedUser: userInfo
    });
  } catch (error) {
    console.error('User deletion error:', error);
    
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'USER_DELETION_ERROR',
      component: 'user_management',
      severity: 'high',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'User deletion failed' });
  }
});

// Change user role endpoint (admin only)
router.put('/users/:userId/role', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole, reason = 'manual_change' } = req.body;

    if (req.user.role !== 'admin') {
      await logActions.accessDenied(req.user.id, 'failure', req, {
        resource: `/api/users/${userId}/role`,
        requiredRole: 'admin',
        userRole: req.user.role,
        reason: 'insufficient_permissions'
      });
      
      return res.status(403).json({ message: 'Only admins can change user roles' });
    }

    if (!newRole || !['admin', 'user'].includes(newRole)) {
      return res.status(400).json({ message: 'Valid role (admin or user) is required' });
    }

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldRole = userToUpdate.role;

    // Prevent changing own role
    if (userId === req.user.id) {
      await logActions.roleChanged(req.user.id, 'failure', req, {
        targetUserId: userId,
        targetUsername: req.user.username,
        oldRole,
        newRole,
        changedBy: req.user.username,
        changeReason: 'self_role_change_attempt'
      });
      
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    // Update user role
    userToUpdate.role = newRole;
    await userToUpdate.save();

    // Log successful role change
    await logActions.roleChanged(req.user.id, 'success', req, {
      targetUserId: userToUpdate._id,
      targetUsername: userToUpdate.username,
      oldRole,
      newRole,
      changedBy: req.user.username,
      changeReason: reason
    });

    res.json({
      message: 'User role updated successfully',
      user: {
        id: userToUpdate._id,
        username: userToUpdate.username,
        email: userToUpdate.email,
        role: userToUpdate.role
      },
      change: {
        oldRole,
        newRole,
        changedBy: req.user.username
      }
    });
  } catch (error) {
    console.error('Role change error:', error);
    
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'ROLE_CHANGE_ERROR',
      component: 'user_management',
      severity: 'high',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'Role change failed' });
  }
});

// Update user settings endpoint
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { settingType, settingName, newValue, changeScope = 'user' } = req.body;

    if (!settingType || !settingName || newValue === undefined) {
      return res.status(400).json({ 
        message: 'Setting type, name, and new value are required' 
      });
    }

    // For now, we'll just log the settings change
    // In a real application, you'd update actual settings storage
    const oldValue = 'previous_value'; // This would come from your settings storage

    // Log settings change
    await logActions.settingsChanged(req.user.id, 'success', req, {
      settingType,
      settingName,
      oldValue,
      newValue: newValue.toString(),
      changedBy: req.user.username,
      changeScope
    });

    res.json({
      message: 'Settings updated successfully',
      setting: {
        type: settingType,
        name: settingName,
        oldValue,
        newValue,
        changedBy: req.user.username,
        changeScope
      }
    });
  } catch (error) {
    console.error('Settings update error:', error);
    
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'SETTINGS_UPDATE_ERROR',
      component: 'settings_management',
      severity: 'medium',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'Settings update failed' });
  }
});

export default router;
