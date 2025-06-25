import QRCode from 'qrcode';
import sequelize from '../database/connect.js';
import Kanban from '../models/kanbanModel.js';
import Stage from '../models/stageModel.js';
import Task from '../models/taskModel.js';
import User from '../models/userModel.js';
import Imputation from '../models/imputationModel.js';
import ForbiddenError from '../error/forbiddenError.js';
import NotFoundError from '../error/notFoundError.js';
import transporter from '../config/mailer.js';
import logger from '../config/logger.js';

const includeKanban = [
  {
    model: Stage,
    as: 'stages',
  },
  {
    model: Task,
    as: 'tasks',
    separate: true,
    order: [['priorityId', 'DESC']],
    include: [
      {
        model: Imputation,
        as: 'imputations',
        attributes: ['id', 'timeSpent'],
      },
    ],
  },
  {
    model: User,
    as: 'users',
    attributes: ['id', 'username', 'firstName', 'lastName'],
  },
];

// Créer un nouveau kanban
export const createKanban = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId)
      throw new ForbiddenError('Access denied: You do not have permission to create Kanban');

    const result = await sequelize.transaction(async (t) => {
      const { title, description, stages } = req.body;

      // Crée un nouveau kanban
      const newKanban = await Kanban.create(
        { title, description, stages },
        {
          transaction: t,
          include: {
            model: Stage,
            as: 'stages',
          },
        }
      );
      // Associe la kanban à l'utilisateur courant
      await newKanban.addUsers([userId], { transaction: t });

      return { newKanban };
    });

    res.statusCode = 201;
    res.data.kanban = result.newKanban;
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupérer tous les kanbans
export const getAllKanbans = async (req, res, next) => {
  try {
    res.data.kanbans = await Kanban.findAll({ include: includeKanban });
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération de tous les kanbans d'un utilisateur
export const getKanbansByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId)
      throw new ForbiddenError('Access denied: You do not have permission to access Kanbans');

    res.data.kanbans = await Kanban.findAll({
      include: [
        ...includeKanban,
        {
          model: User,
          as: 'users',
          where: { id: userId },
          attributes: [],
        },
      ],
    });
    next();
  } catch (error) {
    return next(error);
  }
};

// Récupération d'un kanban par ID
export const getKanbanById = async (req, res, next) => {
  try {
    const kanban = await Kanban.findByPk(req.params.id, {
      include: includeKanban,
    });
    if (!kanban) throw new NotFoundError('Kanban Not Found');

    res.data.kanban = kanban;
    next();
  } catch (error) {
    return next(error);
  }
};

// Mettre à jour un kanban
export const updateKanban = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, stages } = req.body;

  try {
    // Démarrage d'une transaction
    await sequelize.transaction(async (t) => {
      // Récupérer le kanban existant
      const kanban = res.data.kanban;

      // Mise à jour du Kanban
      await kanban.update({ title, description }, { transaction: t });

      // Gestion des statuts
      const existingStages = kanban.stages;
      const existingIds = existingStages.map((stage) => stage.id);

      const stagesToUpdate = stages.filter((s) => s.id && existingIds.includes(s.id));
      const stagesToCreate = stages.filter((s) => !s.id);
      const stagesToDelete = existingStages.filter((stat) => !stages.some((s) => s.id === stat.id));

      // Mise à jour des statuts existants
      for (const stage of stagesToUpdate) {
        await Stage.update(
          { name: stage.name, description: stage.description, maxRecord: stage.maxRecord },
          { where: { id: stage.id }, transaction: t }
        );
      }

      // Création des nouveaux statuts
      if (stagesToCreate.length > 0) {
        const stagesWithKanbanId = stagesToCreate.map((stage) => ({
          ...stage,
          kanbanId: id,
        }));
        await Stage.bulkCreate(stagesWithKanbanId, { transaction: t });
      }

      // Suppression des statuts non inclus dans la requête
      for (const stage of stagesToDelete) {
        await stage.destroy({ transaction: t });
      }
    });

    next();
  } catch (error) {
    return next(error);
  }
};

// Share Kanban
export const shareKanban = async (req, res, next) => {
  try {
    // Récupérer ou générer le lien de partage
    const shareLink = `${process.env.CLIENT_ORIGIN}/kanban/${req.params.id}/join`;

    // Générer le QR code à partir du lien de partage
    QRCode.toDataURL(shareLink, (err, url) => {
      if (err) return res.status(500).json({ error: 'Erreur QR Code' });
      res.json({
        qrCodeUrl: url,
        linkUrl: shareLink,
      });
    });
  } catch (error) {
    return next(error);
  }
};

export const addMemberByMail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) throw new NotFoundError('User Not Found');

    await res.data.kanban.addUsers([user.id]);

    next();
  } catch (error) {
    return next(error);
  }
};

// join kanban
export const joinKanban = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId)
      throw new ForbiddenError('Access denied: You do not have permission to join Kanban');

    // vérifier si userId est déjà dans le kanban
    const isUserInList = await res.data.kanban.hasUser(userId);
    if (isUserInList) throw new ForbiddenError('Access denied: You are already in the list');

    await res.data.kanban.addUsers([userId]);

    next();
  } catch (error) {
    return next(error);
  }
};

// leave kanban
export const leaveKanban = async (req, res, next) => {
  try {
    // Si l'utilisateur est le seul membre du kanban, le kanban est supprimé
    if (res.data.kanban.users.length === 1) {
      await res.data.kanban.destroy();
    } else {
      const userId = req.user.id;
      await res.data.kanban.removeUsers([userId]);
    }
    res.status(204).json();
  } catch (error) {
    return next(error);
  }
};

// Share Kanban by Email
export const shareKanbanByEmail = async (req, res, next) => {
  const { email, linkUrl } = req.body;
  try {
    const kanbanTitle = res.data.kanban?.title || 'Unnamed Kanban'; // Fallback title
    // Construct the mail options
    const mailOptions = {
      from: process.env.MAIL_FROM || '"Kanban App" <noreply@example.com>',
      to: email,
      subject: `Invitation to join Kanban: ${kanbanTitle}`,
      text: `Hello,\n\nYou have been invited to join the Kanban board "${kanbanTitle}".\nClick here to join: ${linkUrl}`,
      html: `<p>Hello,</p><p>You have been invited to join the Kanban board "<strong>${kanbanTitle}</strong>".</p><p><a href="${linkUrl}">Click here to join</a>.</p>`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    logger.info(
      `Invitation email sent to ${email} for Kanban "${kanbanTitle}" with link: ${linkUrl}`
    );
    res.status(200).json({ message: 'Invitation email sent successfully to ' + email });
  } catch (error) {
    logger.error('Error sending email:', {
      message: error.message,
      stack: error.stack,
      email,
      kanbanId: res.data.kanban?.id,
    });
    return next(error);
  }
};
