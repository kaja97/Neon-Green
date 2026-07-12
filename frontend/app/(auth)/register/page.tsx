import { redirect } from 'next/navigation';

export default function RegisterIndex() {
  redirect('/register/request-otp');
}
