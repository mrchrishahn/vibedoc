import Link from "next/link";

export default function SignupSuccess() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 text-center">
        <div className="rounded-full bg-green-100 p-3">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Check your email
        </h1>
        
        <p className="max-w-md text-lg text-gray-600">
          We&apos;ve sent you a confirmation email. Please click the link in the email to verify your account.
        </p>

        <div className="mt-4">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    </main>
  );
} 