import { Op } from 'sequelize';
import User from '../models/userModel.js';
import Role from '../models/roleModel.js';

export const checkAccess = (roles, requiredRoles) => {
  return roles.some((role) => requiredRoles.includes(role.name));
};

export const getAuthorities = async (user) => {
  const roles = await user.getRoles();
  const authorities = [];
  for (let i = 0; i < roles.length; i++) {
    authorities.push(`ROLE_${roles[i].name.toUpperCase()}`);
  }
  return authorities;
};

// Pseudo libre dérivé de celui du serveur SSO (« alice », puis « alice2 »...)
async function availableUsername(wanted) {
  const base = (wanted || 'user').slice(0, 26);
  const taken = await User.findAll({
    attributes: ['username'],
    where: { username: { [Op.like]: `${base}%` } },
  });
  const names = new Set(taken.map((user) => user.username.toLowerCase()));
  let username = base;
  for (let i = 2; names.has(username.toLowerCase()); i++) {
    username = `${base}${i}`;
  }
  return username;
}

// Compte local de l'utilisateur SSO (userinfo du serveur OAuth2).
// La clé est l'id SSO ; au premier login, un compte existant est rattaché une seule fois par e-mail
// (vérifié par le serveur) : l'utilisateur retrouve ses données. Sinon, un compte est créé.
export async function findOrCreateSsoUser(userInfo) {
  const ssoId = String(userInfo.id).toLowerCase();
  const email = String(userInfo.email ?? '')
    .trim()
    .toLowerCase();

  let user = await User.findOne({ where: { ssoId } });
  if (!user && email) {
    user = await User.findOne({ where: { email } });
    if (user) {
      user.ssoId = ssoId;
      await user.save();
    }
  }
  if (!user) {
    if (!email) throw new Error('SSO user without email: is the "email" scope granted?');
    user = await User.create({
      ssoId,
      email,
      username: await availableUsername(userInfo.preferred_username),
    });
    const role = await Role.findOne({ where: { name: 'user' } });
    if (role) await user.addRole(role);
  }
  return user;
}

// Profil renvoyé au front (même forme que l'ancienne réponse de /signin)
export async function getProfile(user) {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    roles: await getAuthorities(user),
    image: user.image,
  };
}
