import type { User } from "../generated/prisma/client.js";
import type {
	UserCreateInput,
	UserSelect,
	UserUpdateInput,
	UserWhereInput,
	UserWhereUniqueInput,
} from "../generated/prisma/models.js";
import { prisma } from "../libs/prisma.client.js";

class UserRepository {
	async find(
		where: UserWhereUniqueInput,
		select?: UserSelect,
	): Promise<User | null> {
		return prisma.user.findUnique({
			where,
			select,
		});
	}

	async create(data: UserCreateInput): Promise<User> {
		return prisma.user.create({ data });
	}

	async update(
		where: UserWhereUniqueInput,
		data: UserUpdateInput,
	): Promise<User> {
		return prisma.user.update({ where, data });
	}

	async delete(where: UserWhereUniqueInput): Promise<User> {
		return prisma.user.delete({ where });
	}

	async count(where: UserWhereInput = {}): Promise<number> {
		return prisma.user.count({ where });
	}
}

export default new UserRepository();