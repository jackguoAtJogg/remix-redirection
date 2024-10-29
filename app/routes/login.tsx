import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { commitSession, getSession } from "../session";

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();

	const session = await getSession(request.headers.get("Cookie"));

	try {
		const response = await fetch(
			"https://staging-studio-api.jogg.co/login",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(Object.fromEntries(formData)),
			},
		);

		console.log(response, "Fetch Response");

		if (!response.ok) {
			const errorText = await response.text();
			const errorMessage = `Login failed: ${
				errorText || response.statusText
			}`;
			throw new Error(errorMessage);
		}

		const responseData = await response.json();

		console.log(responseData, "Parsed Response Data");

		await session.set("studio-session", responseData.access_token);

		console.log("redirecting to dashboard *******");
		const cookie = await commitSession(session);

		return redirect("/dashboard", {
			headers: {
				"Set-Cookie": cookie,
			},
		});
	} catch (err) {
		console.error("Error during login:", err);
		return json(
			{
				error: "Login failed. Please check your credentials and try again.",
			},
			{ status: 500 },
		);
	}
};

export default function LoginForm() {
	const actionData = useActionData();

	return (
		<div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto mt-10">
			<h2 className="text-2xl font-semibold text-center mb-6">
				Login to Your Account
			</h2>
			{actionData?.error && (
				<div className="mb-4 text-red-600 text-center">
					{actionData.error}
				</div>
			)}
			<Form method="post" className="space-y-4">
				<div>
					<label htmlFor="email" className="block text-gray-700 mb-2">
						Email Address
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="you@example.com"
					/>
				</div>
				<div>
					<label
						htmlFor="password"
						className="block text-gray-700 mb-2"
					>
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="••••••••"
					/>
				</div>
				<div className="flex items-center justify-between">
					<label className="flex items-center">
						<input
							type="checkbox"
							name="remember"
							className="form-checkbox h-4 w-4 text-blue-600"
						/>
						<span className="ml-2 text-gray-700">Remember me</span>
					</label>
					<a
						href="/forgot-password"
						className="text-blue-600 hover:text-blue-800 text-sm"
					>
						Forgot password?
					</a>
				</div>
				<button
					type="submit"
					className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
				>
					Login
				</button>
			</Form>
			<p className="mt-6 text-center text-gray-600 text-sm">
				Don't have an account?
				<a
					href="/signup"
					className="text-blue-600 hover:text-blue-800 ml-1"
				>
					Sign up
				</a>
			</p>
		</div>
	);
}
