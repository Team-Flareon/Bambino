import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebaseConfig.js';
import LoadingPage from '../components/LoadingPage.js';
import { useEffect } from 'react';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const { query } = useRouter();
  const inviteToken = query;
  // console.log('"/" form inviteToken:', inviteToken);

  useEffect(() => {
    const updateUsers = async () => {
      if (user) {
        console.log('INDEX USER: ', user);
        console.log('DISPLAY NAME: ', user.displayName);
        const docRef = doc(db, 'users', user.uid);
        const docSnapshot = await getDoc(docRef);
        console.log('DOC SS', docSnapshot?.data());
        await setDoc(
          doc(db, 'users', user.uid),
          {
            firstName: docSnapshot?.data()?.firstName,
            lastName: docSnapshot?.data()?.lastName,
            email: user.email,
            phoneNumber: docSnapshot?.data()?.phoneNumber,
            lastSeen: serverTimestamp(),
          },
          { merge: true }
        );
      }
    };
    updateUsers();
  }, [user]);

  const handleUser = () => {
    if (loading) {
      return <LoadingPage />;
    }

    if (error) {
      return (
        <div>
          <p>Error: {error}</p>
        </div>
      );
    }

    if (user) {
      if (inviteToken) {
        router.push({
          pathname: '/overview',
          query: inviteToken,
        });
      } else {
        router.push('/overview');
      }
    }

    if (!user) {
      if (inviteToken) {
        router.push({
          pathname: '/login',
          query: inviteToken,
        });
      } else {
        router.push('/login');
      }
    }
  };

  return <>{handleUser()}</>;
}
