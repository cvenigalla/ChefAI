# Chatbot Application with Google Cloud and Vertex AI

This project deploys a chatbot application using Google Cloud Platform services, specifically App Engine and Vertex AI.

## Project Overview

This application is a web-based chatbot that uses Vertex AI for natural language processing. It's deployed on Google App Engine and interacts with Vertex AI's language models.

## Deployment Steps

1. **Project Setup**
   - Create a new project in Google Cloud Platform
   - Enable necessary APIs: App Engine, Vertex AI, Cloud Build

2. **Service Account and Permissions**
   - Create a service account for the application
   - Grant necessary permissions to the service account
   - Download and set up the service account key

3. **Local Development Environment**
   - Set up the local development environment
   - Install Google Cloud SDK

4. **Application Code**
   - Create `main.py` with Flask application and Vertex AI integration
   - Develop frontend files (HTML, CSS, JavaScript)
   - Create `requirements.txt` for dependencies
   - Create `app.yaml` for App Engine configuration

5. **Dependency Management**
   - Resolve version conflicts between Flask, Werkzeug, and Vertex AI
   - Update `requirements.txt` with compatible versions

6. **Deployment**
   - Use `gcloud app deploy` command to deploy the application
   - Troubleshoot deployment issues related to permissions and Cloud Build

7. **Error Handling**
   - Resolve 502 Bad Gateway errors
   - Analyze application logs to identify root causes
   - Fix import issues by specifying exact versions of Flask and Werkzeug

8. **Testing and Verification**
   - Access the deployed application via provided URL
   - Verify that the chatbot is functioning correctly

9. **Cost Management**
   - Monitor costs associated with App Engine and Vertex AI
   - Set up billing alerts and optimize resource usage

## Key Files

- `main.py`: Main application file
- `requirements.txt`: Python dependencies
- `app.yaml`: App Engine configuration
- `static/index.html`: Frontend HTML
- `static/styles.css`: CSS styles
- `static/script.js`: Frontend JavaScript

## Deployment Command

To deploy the application, use: