import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import InvalidCredentialsError from '../error/invalidCredentialsError.js';
import { comparePasswords } from './passwordService.js';

export async function authenticateUser(email, password) {
  const user = await User.findOne({
    where: { email },
    include: [Role]
  });

  if (!user) throw new InvalidCredentialsError('Invalid credentials');

  const validPassword = await comparePasswords(password, user.password);
  if (!validPassword) throw new InvalidCredentialsError('Invalid credentials');

  const authorities = await getAuthorities(user);

  return { user, authorities };
}

export const checkAccess = (roles, requiredRoles) => {
  return roles.some(role => requiredRoles.includes(role.name));
};

export const getAuthorities = async (user) => {
  const roles = await user.getRoles();
  const authorities = [];
  for (let i = 0; i < roles.length; i++) {
    authorities.push(`ROLE_${roles[i].name.toUpperCase()}`);
  }
  return authorities;
};
