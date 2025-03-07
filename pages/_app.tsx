import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import type { NextPage } from 'next';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { appWithTranslation } from 'next-i18next';
import { ReactElement, ReactNode } from 'react';

import { AccountLayout } from '@components/layouts';

import '../styles/globals.css';

const unauthenticatedRoutes = [
  '/',
  '/admin/auth/login',
  '/well-known/saml-configuration',
  '/oauth/jwks',
  '/idp/select',
  '/error',
];

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const { pathname } = useRouter();

  const { session, ...props } = pageProps;

  const getLayout = Component.getLayout;

  // If a page level layout exists, use it
  if (getLayout) {
    return (
      <>
        {getLayout(<Component {...props} />)}
        <Toaster toastOptions={{ duration: 5000 }} />
      </>
    );
  }

  if (unauthenticatedRoutes.includes(pathname)) {
    return <Component {...props} />;
  }

  return (
    <SessionProvider session={session}>
      <AccountLayout>
        <Component {...props} />
        <Toaster toastOptions={{ duration: 5000 }} />
      </AccountLayout>
    </SessionProvider>
  );
}

export default appWithTranslation<never>(MyApp);

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  pageProps: {
    session?: Session;
  };
};

export type NextPageWithLayout<P = Record<string, unknown>> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};
