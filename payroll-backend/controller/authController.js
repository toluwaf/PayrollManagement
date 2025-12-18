const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const ResponseHelper = require('../helpers/responseHelper');

class AuthController {
  async login(req, res) {
    const { ctx :{ db }} = req
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ResponseHelper.error(res, 'Email and password are required', 400);
      }

      // Find user by email
      const query = `
        FOR user IN users
        FILTER user.email == @email
        RETURN user
      `;

      const user = await db.QueryFirst(query, { email });

      // console.log(user)
      if (!user) {
        return ResponseHelper.error(res, 'Invalid credentials', 401);
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return ResponseHelper.error(res, 'Invalid credentials', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        return ResponseHelper.error(res, 'Account is deactivated', 401);
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._key, 
          email: user.email, 
          role: user.role,
          name: user.name,
          department: user.department
        },
        process.env.JWT_SECRET || 'woiuanldslkfjaiousdflkj',
        { expiresIn: '3h' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      ResponseHelper.success(res, {
        user: userWithoutPassword,
        token
      }, 'Login successful');

    } catch (error) {
      ResponseHelper.error(res, 'Login failed', 500, error.message);
    }
  }

  async register(req, res) {
    const { ctx :{ db }} = req
    try {
      const { email, password, name, role, department } = req.body;

      if (!email || !password || !name || !role) {
        return ResponseHelper.error(res, 'All fields are required', 400);
      }

      // Check if user already exists
      const existingUserQuery = `
        FOR user IN users
        FILTER user.email == @email
        RETURN user._key
      `;

      const existingUser = await db.QueryFirst(existingUserQuery, { email });
      if (existingUser) {
        return ResponseHelper.error(res, 'User already exists', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userData = {
        email,
        password: hashedPassword,
        name,
        role,
        department: department || null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newUser = await db.AddDocument('users', userData);

      // Generate token
      const token = jwt.sign(
        { 
          userId: newUser._key, 
          email: newUser.email, 
          role: newUser.role,
          name: newUser.name 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;

      ResponseHelper.success(res, {
        user: userWithoutPassword,
        token
      }, 'User registered successfully', 201);

    } catch (error) {
      ResponseHelper.error(res, 'Registration failed', 500, error.message);
    }
  }

  async getProfile(req, res) {
    const { ctx :{ db }} = req
    try {
      const userId = req.user.userId;

      const query = `
        FOR user IN users
        FILTER user._key == @userId
        RETURN user
      `;

      const user = await db.QueryFirst(query, { userId });

      if (!user) {
        return ResponseHelper.error(res, 'User not found', 404);
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      ResponseHelper.success(res, userWithoutPassword, 'Profile retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to get profile', 500, error.message);
    }
  }

  async updateProfile(req, res) {
    const { ctx :{ db }} = req
    try {
      const userId = req.user.userId;
      const updateData = req.body;

      // Don't allow password updates through this endpoint
      if (updateData.password) {
        delete updateData.password;
      }

      updateData.updatedAt = new Date().toISOString();

      const updatedUser = await db.UpdateDocument('users', userId, updateData);

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;

      ResponseHelper.success(res, userWithoutPassword, 'Profile updated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to update profile', 500, error.message);
    }
  }

  async changePassword(req, res) {
    const { ctx :{ db }} = req
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return ResponseHelper.error(res, 'Current and new password are required', 400);
      }

      // Get user with password
      const query = `
        FOR user IN users
        FILTER user._key == @userId
        RETURN user
      `;

      const user = await db.QueryFirst(query, { userId });

      if (!user) {
        return ResponseHelper.error(res, 'User not found', 404);
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return ResponseHelper.error(res, 'Current password is incorrect', 400);
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await db.UpdateDocument('users', userId, {
        password: hashedNewPassword,
        updatedAt: new Date().toISOString()
      });

      ResponseHelper.success(res, null, 'Password changed successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Failed to change password', 500, error.message);
    }
  }
}

module.exports = new AuthController();