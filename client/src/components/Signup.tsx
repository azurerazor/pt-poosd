import FormCard from "./forms/FormCard";
import InputEmail from "./forms/InputEmail";
import InputPassword from "./forms/InputPassword";
import InputTextRegex from "./forms/InputTextRegex";
import Submit from "./forms/Submit";
import Link from "./misc/Link";

export default function Signup() {
    return (
        <FormCard>
            <h2 className="text-3xl font-bold">Sign up</h2>
            <p className="text-base-content mb-4">
                Already have an account? <Link href='/login' text='Log in here' />
            </p>
            <InputTextRegex
                name='username'
                label='Username'
                minLength={3}
                maxLength={16}
                pattern='[A-Za-z0-9]+(?:[-_]*[A-Za-z0-9]+)*[A-Za-z0-9]+'
                validatorHint="3-16 letters, numbers, underscores or hyphens"
                placeholder='super-cool-username'
            />
            <InputEmail
                name='email'
                label='Email'
                placeholder='you@gmail.com'
            />
            <InputPassword
                name='password'
                label='Password'
                placeholder='password1234'
            />
            <Submit value="Sign up" />
        </FormCard>
    );
}
