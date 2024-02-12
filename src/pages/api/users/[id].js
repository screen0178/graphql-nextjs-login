// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Client, cacheExchange, fetchExchange, gql } from '@urql/core';
import { authExchange } from '@urql/exchange-auth';

export default async function handler(req, res) {
	const client = new Client({
		url: 'http://207.148.68.106:2301/query',
		exchanges: [
			cacheExchange,
			authExchange(async (utils) => {
				const token = req.headers.authorization;
				return {
					addAuthToOperation(operation) {
						if (!token) return operation;
						return utils.appendHeaders(operation, {
							Authorization: `Bearer ${token}`,
						});
					},
				};
			}),
			fetchExchange,
		],
	});

	const { id } = req.query;
	const GetUserByID = gql`
			query GetUserById($id: ID!) {
				userById(id: $id) {
					id
					email
					name
				}
			}
	`;

	const resdata = await client.query(GetUserByID, { id });

	if (!resdata?.data) {
		return res.status(404).json({ message: 'User not Found' });
	}

	const { data } = resdata;

	res.status(200).json({
		statusCode: 200,
		result: {
			avatar: 'https://i.pravatar.cc',
			email: data.userById.email,
			fullName: data.userById.name,
			id: data.userById.id,
		},
	});
}
