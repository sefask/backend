const express = require('express');
const router = express.Router();
const { createAssignment, getAssignments, getAssignment, deleteAssignment } = require('../controllers/assignment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All assignment routes require authentication
router.use(authenticateToken);

// Create a new assignment
router.post('/', createAssignment);

// Get all assignments for the authenticated user
router.get('/', getAssignments);

// Get a specific assignment by ID
router.get('/:id', getAssignment);

// Delete an assignment
router.delete('/:id', deleteAssignment);

module.exports = router;
