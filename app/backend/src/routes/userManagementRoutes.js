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
    await logActions.profileUpdate(req.user.id, 'success', req, {
      reason: 'user_created',
      targetUserId: user._id,
      targetUsername: username,
      fieldsChanged: ['username', 'email', 'role']
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

export default router;
