# Welcome to ClassMosaic - A classroom reflection tool

ClassMosaic is a web-based platform designed for building and managing programming tasks, primarily for educational purposes. It enables teachers to create classes, manage sessions, and design tasks that students can solve directly in the browser.

A core feature is its deep integrations of different languages, allowing for the creation, submission, and analysis of programming projects.

The system supports features like user management (teachers, admins), class and session management, task creation with reference solutions, student progress tracking, and advanced solution analysis, including dissimilarity analysis. Authentication is handled via OpenID Connect, with Microsoft being a specified provider.

## Core features

### User management and authentication

ClassMosaic employs a sophisticated authentication and security model designed to handle different user roles with varying levels of access and privacy requirements.

It integrates with external OpenID Connect (OIDC) providers for primary identity verification of administrative users (`TEACHER` and `ADMIN`) and implements a custom, privacy-preserving cryptographic mechanism for `STUDENT` authentication within a session.

### Task management

Teachers can create, view, edit, and delete tasks. A task consists of a title, description, type (e.g., `SCRATCH`), and a task file (a `.sb3` blob for Scratch).

The task creation and editing process happens in a dedicated form (`TaskForm.tsx`) which opens a modal containing the embedded Scratch editor (`/edit`). In this editor, the teacher can define the initial project, set constraints on which blocks can be used, and define reference solutions.

### Session and solution analysis

Teachers can create sessions within a class, assigning one or more tasks to it. Students can then join the session to solve these tasks.

As students submit solutions, the platform analyzes them. Key analysis features include:

**Progress Tracking**: Teachers can view the progress of all students in a session, including which tasks they have attempted and their success.

**Code Viewing**: Teachers can view the code of any submission in a read-only interface.

**Dissimilarity Analysis**: The system can identify and display a specified number of the most dissimilar solutions for a given task, helping teachers find a variety of approaches. This can be done for all sub-tasks or filtered to a specific one.

### Testing

The project has a comprehensive testing strategy.

**Unit Tests**: Jest is used for unit testing components and logic.

**Component Tests**: Playwright is configured for component testing.

**End-to-End (E2E) Tests**: The e2e directory contains Playwright tests that cover major user flows like user management, task management, and session analysis. These tests interact with the live application, mock API responses, and assert UI state.

## Summary

ClassMosaic is a robust educational platform for teaching programming. Its architecture separates concerns between a Next.js frontend, a NestJS backend, and highly integrated applications for programming languages. The system provides a rich feature set for teachers to manage their curriculum and analyze student work, supported by a strong testing foundation to ensure reliability.
