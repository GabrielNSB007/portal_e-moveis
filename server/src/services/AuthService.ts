import { DocumentStatus, Prisma, UserRole } from "@prisma/client";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { MessagesEnum } from "../shared/enums/messagesEnum.js";
import { SystemConstantsEnum } from "../shared/enums/systemConstantsEnum.js";
import { generateAccessToken } from "../utils/jwtUtils.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export class AuthService {
  private authRepository = new AuthRepository();

  async authUser(email: string, password: string): Promise<string> {
    const dbUser = await this.authRepository.getByEmail(email);

    if (!dbUser || !(await bcrypt.compare(password, dbUser.password))) {
      throw new Error(MessagesEnum.ERROR_INVALID_CREDENTIALS);
    }
    const userId = dbUser.id;

    const token = generateAccessToken(userId);
    return token;
  }

  async registerUser(
    email: string,
    password: string,
    name: string,
    userRole: UserRole,
    phone?: string,
  ): Promise<string> {
    const dbUser = await this.authRepository.getByEmail(email);
    if (dbUser) throw new Error(MessagesEnum.ERROR_EMAIL_ALREADY_REGISTERED);

    password = await bcrypt.hash(
      password,
      SystemConstantsEnum.BCRYPT_SALT_ROUNDS,
    );
    const newUser = await this.authRepository.create(
      email,
      password,
      userRole,
      phone,
      name,
    );

    const token = generateAccessToken(newUser.id);
    return token;
  }

  async profileData(userId: string) {
    const user = await this.authRepository.getById(userId);
    if (!user) throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND);

    return user;
  }



  async requestPasswordRecovery(email: string) {
    const user = await this.authRepository.getByEmail(email);
    if (!user) return { recoveryCodeSent: true };

    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(recoveryCode, SystemConstantsEnum.BCRYPT_SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.authRepository.createPasswordRecoveryCode(user.id, codeHash, expiresAt);
    console.info(`[DEV] C?digo de recupera??o para ${user.email}: ${recoveryCode}`);
    return { recoveryCodeSent: true };
  }

  async resetPasswordWithCode(email: string, code: string, password: string) {
    const user = await this.authRepository.getByEmail(email);
    if (!user) throw new Error(MessagesEnum.ERROR_INVALID_CREDENTIALS);

    const recovery = await this.authRepository.getLatestPasswordRecoveryCode(user.id);
    if (!recovery || !(await bcrypt.compare(code, recovery.codeHash))) {
      throw new Error(MessagesEnum.ERROR_INVALID_CREDENTIALS);
    }

    await this.authRepository.update(user.id, {
      password: await bcrypt.hash(password, SystemConstantsEnum.BCRYPT_SALT_ROUNDS),
    });
    await this.authRepository.markPasswordRecoveryCodeUsed(recovery.id);
    return { passwordReset: true };
  }

  async profileDetails(userId: string) {
    const user = await this.authRepository.getById(userId);
    if (!user) throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND);

    return this.authRepository.getProfileDetails(userId);
  }

  async updateProfileDetails(
    userId: string,
    input: {
      avatarUrl?: string | null;
      income?: number | null;
      downPayment?: number | null;
      needsFinancing?: boolean | null;
      purchaseType?: string | null;
      documentId?: string | null;
    },
  ) {
    const user = await this.authRepository.getById(userId);
    if (!user) throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND);

    const data: Prisma.UserProfileUncheckedUpdateInput = {};
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
    if (input.income !== undefined) data.income = input.income === null ? null : new Prisma.Decimal(input.income);
    if (input.downPayment !== undefined) data.downPayment = input.downPayment === null ? null : new Prisma.Decimal(input.downPayment);
    if (input.needsFinancing !== undefined) data.needsFinancing = input.needsFinancing;
    if (input.purchaseType !== undefined) data.purchaseType = input.purchaseType;
    if (input.documentId !== undefined) {
      data.documentId = input.documentId;
      data.documentStatus = input.documentId ? DocumentStatus.REVIEW : DocumentStatus.PENDING;
      data.documentSubmittedAt = input.documentId ? new Date() : null;
      data.verifiedAt = null;
    }

    return this.authRepository.upsertProfileDetails(userId, data);
  }

  async updateUser(
    userId: string,
    email?: string,
    name?: string,
    password?: string,
    currentPassword?: string,
    phone?: string,
    userRole?: UserRole,
  ) {
    const user = await this.authRepository.getById(userId);
    if (!user) throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND);

    // Validar email único se for atualizado
    if (email && email !== user.email) {
      const existingUser = await this.authRepository.getByEmail(email);
      if (existingUser)
        throw new Error(MessagesEnum.ERROR_EMAIL_ALREADY_REGISTERED);
    }

    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (userRole) updateData.role = userRole;
    if (password) {
      const userWithPassword = await this.authRepository.getByIdWithPassword(userId);
      const currentPasswordMatches = currentPassword && userWithPassword
        ? await bcrypt.compare(currentPassword, userWithPassword.password)
        : false;

      if (!currentPasswordMatches) {
        const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.info(`[DEV] Código de recuperação para ${user.email}: ${recoveryCode}`);
        throw new Error(MessagesEnum.ERROR_CURRENT_PASSWORD_INVALID);
      }

      updateData.password = await bcrypt.hash(
        password,
        SystemConstantsEnum.BCRYPT_SALT_ROUNDS,
      );
    }

    const updatedUser = await this.authRepository.update(userId, updateData);
    return updatedUser;
  }

  async deleteUser(userId: string) {
    const user = await this.authRepository.getById(userId);
    if (!user) throw new Error(MessagesEnum.ERROR_USER_NOT_FOUND);

    const deletedUser = await this.authRepository.delete(userId);
    return deletedUser;
  }
}
