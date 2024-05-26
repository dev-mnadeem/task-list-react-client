import * as Yup from "yup";

export const MIN_PASSWORD_LENGTH = 8;

const email = Yup.string()
  .trim()
  .email("That does not look like an email address")
  .required("Email address is required");

const password = Yup.string()
  .min(MIN_PASSWORD_LENGTH, `At least ${MIN_PASSWORD_LENGTH} characters`)
  .required("Password is required");

export const signInSchema = Yup.object({ email, password });

export const signUpSchema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  email,
  password,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

export const schemaFor = (isSignIn) => (isSignIn ? signInSchema : signUpSchema);
