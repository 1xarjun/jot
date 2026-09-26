"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from "next/navigation";

export const AuthContext = createContext(null); // initially null

export default function AuthProvider({ children }) {

	const [user, setUser] = useState(null);
	const supabase = createClient();
	const pathname = usePathname();

	useEffect(() => {

		const fetchUser = async () => { // get session data from the cookie sent by supabase

      // TODO: this is providing stale data when doing local login
			const { data, error } = await supabase.auth.getSession();

			if (error) {
        console.error('Error fetching session: ', error.message);
      } else {
				setUser(data.session?.user || null);
			}
		}

		fetchUser();

		// basically sets a listener for detecting logins/logouts/session-expire etc. and then update the user accordingly
		const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
			setUser(session?.user || null);
		});

		return () => listener.subscription.unsubscribe(); // cleans up listener when react unmounts this component

	}, [pathname])

	return (
		<AuthContext.Provider value={{ user, setUser }} >
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
