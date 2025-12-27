# Dockerfile for Network Threat Detection AI Service
FROM public.ecr.aws/lambda/python:3.11

# Alternative: Use regular Python image for ECS
# FROM python:3.11-slim

# Install system dependencies (Java for CICFlowMeter)
RUN yum install -y java-1.8.0-openjdk && \
    yum clean all

# Alternative for Debian/Ubuntu base:
# RUN apt-get update && \
#     apt-get install -y openjdk-8-jdk && \
#     apt-get clean

# Set working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy CICFlowMeter (download if not present)
COPY tools/CICFlowMeter.jar /opt/CICFlowMeter/CICFlowMeter.jar
RUN chmod +x /opt/CICFlowMeter/CICFlowMeter.jar || true

# Copy application code
COPY ai_service/ ${LAMBDA_TASK_ROOT}/ai_service/
COPY src/ ${LAMBDA_TASK_ROOT}/src/
COPY models/ ${LAMBDA_TASK_ROOT}/models/

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt -t ${LAMBDA_TASK_ROOT}

# Set environment variables
ENV CICFLOWMETER_JAR=/opt/CICFlowMeter/CICFlowMeter.jar
ENV PYTHONUNBUFFERED=1

# For Lambda: use Mangum handler
# CMD [ "ai_service.main.handler" ]

# For ECS/regular: use uvicorn directly
CMD ["python", "ai_service/main.py"]



