import {LoginForm} from "@/components/login-form";
import {ModeToggle} from "@/components/mode-toggle";

const LoginPage = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <span className="absolute top-2 right-2">
        <ModeToggle/>
      </span>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
export default LoginPage
