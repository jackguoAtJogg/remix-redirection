import { Form } from '@remix-run/react'
import { useLoaderData } from '@remix-run/react'
import { getSession } from '../session' // Adjust the path as needed
import { json, redirect } from '@remix-run/node'

export const loader = async ({ request }) => {
    const session = await getSession(request.headers.get('Cookie'))
    console.log(session, '@@@@@@@@@@@@@@')
    console.log(session.has('studio-session'))
    const sessionToken = await session.get('studio-session')

    console.log(
        session.get('studio-session'),
        'session value ***&&&^^^^^^^%%%%'
    )

    // if (!sessionToken) {
    //     console.log(sessionToken, 'sessionToken &&&&&&&*******#########')
    //     return redirect('/login')
    // }

    try {
        const user = await fetch('https://staging-studio-api.jogg.co/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionToken}`
            }
        })
        return { user: await user.json() }
    } catch (err) {
        return null
    }
}

export default function Dashboard() {
    const { user } = useLoaderData()
    console.log(user, 'user')

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">
                    Welcome, {user.data.first_name}!
                </h1>
                {/* Your dashboard content here */}

                {/* Logout Button */}
                <Form method="post" action="/logout">
                    <button
                        type="submit"
                        className="mt-6 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </Form>
            </div>
        </div>
    )
}
