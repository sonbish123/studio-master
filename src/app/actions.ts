
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addReport as addReportData, getReports as getReportsData, deleteReport as deleteReportData } from '@/lib/data';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function submitReport(data: any) {
  try {
    addReportData(data);
    revalidatePath('/admin');
    return { success: true, message: "Report submitted successfully!" };
  } catch (error) {
    console.error("Error submitting report:", error);
    return { success: false, message: "Failed to submit report." };
  }
}

export async function getReports() {
  return getReportsData();
}

export async function deleteReport(reportId: string) {
  try {
    deleteReportData(reportId);
    revalidatePath('/admin');
    return { success: true, message: 'Report deleted successfully!' };
  } catch (error) {
    console.error('Error deleting report:', error);
    return { success: false, message: 'Failed to delete report.' };
  }
}

const SESSION_COOKIE_NAME = 'session';

export async function login(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (username === 'admin' && password === 'admin') {
    const sessionData = { username: 'admin', loggedIn: true };
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // One day
      path: '/',
    });
    redirect('/admin');
  }

  return {
    error: 'Invalid username or password.',
  };
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.loggedIn) {
      return session;
    }
  } catch (error) {
    console.error('Invalid session cookie:', error);
  }
  return null;
}
