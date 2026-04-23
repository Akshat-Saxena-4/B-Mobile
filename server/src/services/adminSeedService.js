import env from '../config/env.js';
import { ROLES } from '../constants/roles.js';
import User from '../models/User.js';

const DEFAULT_ADMIN_PROFILE = {
  firstName: 'Admin',
  lastName: 'User',
};

const hasAdminBootstrapConfig = () =>
  Boolean(env.adminLoginEmail) && Boolean(env.adminLoginPassword);

export const ensureAdminAccount = async ({ logger } = {}) => {
  if (!hasAdminBootstrapConfig()) {
    logger?.info(
      'Skipping admin bootstrap because ADMIN_LOGIN_EMAIL or ADMIN_LOGIN_PASSWORD is not configured.'
    );
    return { skipped: true, reason: 'missing-config' };
  }

  if (env.adminLoginPassword.length < 6) {
    logger?.error('Skipping admin bootstrap because ADMIN_LOGIN_PASSWORD must be at least 6 characters long.');
    return { skipped: true, reason: 'invalid-password-length' };
  }

  const existingUser = await User.findOne({ email: env.adminLoginEmail }).select('+password');

  if (!existingUser) {
    await User.create({
      ...DEFAULT_ADMIN_PROFILE,
      email: env.adminLoginEmail,
      password: env.adminLoginPassword,
      role: ROLES.ADMIN,
      isActive: true,
    });

    logger?.info(`Created startup admin account: ${env.adminLoginEmail}`);
    return { created: true, email: env.adminLoginEmail };
  }

  let updated = false;

  if (!existingUser.firstName?.trim()) {
    existingUser.firstName = DEFAULT_ADMIN_PROFILE.firstName;
    updated = true;
  }

  if (!existingUser.lastName?.trim()) {
    existingUser.lastName = DEFAULT_ADMIN_PROFILE.lastName;
    updated = true;
  }

  if (existingUser.role !== ROLES.ADMIN) {
    existingUser.role = ROLES.ADMIN;
    updated = true;
  }

  if (!existingUser.isActive) {
    existingUser.isActive = true;
    updated = true;
  }

  if (!(await existingUser.comparePassword(env.adminLoginPassword))) {
    existingUser.password = env.adminLoginPassword;
    updated = true;
  }

  if (updated) {
    await existingUser.save();
    logger?.info(`Synchronized startup admin account: ${env.adminLoginEmail}`);
    return { updated: true, email: env.adminLoginEmail };
  }

  logger?.info(`Startup admin account already in sync: ${env.adminLoginEmail}`);
  return { unchanged: true, email: env.adminLoginEmail };
};
