import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { handleSignUp } from '../login/actions';
import { OAuthButtons } from '../login/oauth-providers';
import { redirect } from 'next/navigation';

export default async function Signup() {

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()

    if(user) {
        return redirect('/')
    }

    return (
        <div className='flex min-h-screen p-4 bg-gray-50 justify-center items-center'>
            <div className='bg-white w-md h-full border border-[#ddd] shadow-sm rounded-md px-6 py-8 text-sm text-gray-800 flex flex-col gap-4'>
                <div className='mb-2'>
                    <span className='text-2xl font-bold'>Sign up</span>
                    <p className='text-xs text-gray-500'>Choose your preferred sign up method</p>
                </div>

                <div>
                    <form action={handleSignUp} className='flex flex-col gap-4' >
                        <div className='flex flex-col gap-1'>
                            <label className='font-medium'>Username</label>
                            <input
                                name="username"
                                type='text'
                                placeholder='name'
                                className='outline-offset-4 focus:outline-2 focus:dark:outline-gray-500 p-2 border border-[#ddd] rounded-md'
                                required />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='font-medium'>Email</label>
                            <input
                                name="email"
                                type='email'
                                placeholder='name@example.com'
                                 className='outline-offset-4 focus:outline-2 focus:dark:outline-gray-500 p-2 border border-[#ddd] rounded-md'
                                required />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='font-medium'>Password</label>
                            <input
                                name="password"
                                type='password'
                                className='outline-offset-4 focus:outline-2 focus:dark:outline-gray-500 p-2 border border-[#ddd] rounded-md'
                                required />
                        </div>

                        <button
                            type="submit"
                            className="outline-offset-2 focus:outline-2 focus:dark:outline-gray-500 flex gap-2 justify-center items-center cursor-pointer text-xs bg-[#171717] hover:bg-[#171717]/90 text-white h-9 px-4 py-2 has-[>svg]:px-3 rounded-md font-medium disabled:pointer-events-none disabled:opacity-50"
                        >
                            <Mail className='w-4 h-4' />
                            Sign up with Email
                        </button>
                    </form>

                    {/*{message && <p className="mt-3 text-sm text-red-500">{message}</p>}*/}
                </div>

                <div className="flex items-center">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="text-gray-500 text-xs mx-2">OR CONTINUE WITH</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>

                <OAuthButtons />

                <div className='flex gap-1 justify-center'>
                    <span className='text-gray-500'>Already have an account?</span>
                    <Link href='/login' className='underline-offset-4 hover:underline font-medium'>
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    )
}
