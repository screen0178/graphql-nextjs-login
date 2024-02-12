// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Client, cacheExchange, fetchExchange, gql } from '@urql/core';

const client = new Client({
	url: 'http://207.148.68.106:2301/query',
	exchanges: [cacheExchange, fetchExchange],
});

function parseJwt(token) {
	return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

export default async function handler(req, res) {
	if (req.method === 'POST') {
		const { body: { email, password } = {} } = req;

		const LoginMutation = gql`
			mutation LoginMutation($email: String!, $password: String!) {
				login(email: $email, password: $password) {
					token
					name
					email
						permissions{
						id
						name
						feature
					}
				}
			}
		`;

		const resdata = await client.mutation(LoginMutation, { email, password });

		if (!resdata?.data) {
			return res.status(403).json({ message: 'Email or password is not correct' });
		}

		const { data } = resdata;
		console.log(JSON.stringify(data,null,2))
		res.status(200).json({
			statusCode: 200,
			result: {
				id: data.login.token,
				user: {
					email: data.login.email,
					fullName: data.login.name,
					role: 'admin',
				},
				userId: parseJwt(data.login.token).user_id,
				extra: data,
			},
		});
	} else {
		res.status(404).json({ message: 'Api is not found' });
	}
}
