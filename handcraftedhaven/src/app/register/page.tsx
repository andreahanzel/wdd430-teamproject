import RegisterForm from "@/components/ui/register-form";

export default function Register() {
	return (
		<main className="min-h-screen px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
			<div className="max-w-md w-full">
				<RegisterForm />
			</div>
		</main>
	);
}
