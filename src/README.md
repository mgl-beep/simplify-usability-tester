# SIMPLIFY

A comprehensive LMS interface that serves as an alternative to Canvas with built-in accessibility and usability scanning capabilities.

## Overview

SIMPLIFY is an AI-powered LMS accessibility and design tool that integrates with Canvas to analyze courses against multiple standards and provide automated fixes.

## Features

### Standards-Based Scanning
- **CVC-OEI Course Design Rubric** (2020) - 52 criteria
- **Peralta Online Equity Rubric** (3.0) - 38 criteria
- **Quality Matters Higher Education Rubric** (7th Edition) - 43 criteria
- **WCAG 2.2 AA** - 86 success criteria

### AI-Powered Fixes
- Meaningful alt text generation with contextual analysis
- Smart color fixes maintaining WCAG compliance
- Content readability improvements
- Navigation optimization

### Canvas Integration
- Real-time course content analysis
- Direct API integration for auto-fixes
- IMSCC import/export support
- Batch fix capabilities with undo option

## Architecture

### Frontend
- React with TypeScript
- Tailwind CSS v4
- Lucide React icons
- Canvas-style typography and components

### Backend
- Supabase (PostgreSQL + KV Store)
- Hono web server
- RESTful API
- Canvas LMS API integration

## Dashboard Layout

### 3-Tab Interface
1. **Overview** - Scan results and issue tracking
2. **Analytics** - Course analytics with persistent Usability Scorecard
3. **Builders** - AI Assignment Generator, Syllabus Builder, Course Builder Template

## Setup

This project is built with Figma Make and integrates with:
- Canvas LMS API
- Supabase backend services
- AI services for smart content fixes

## Development

Built with modern web technologies and Apple-inspired design principles for clean, accessible interfaces.

## License

Private project - All rights reserved
