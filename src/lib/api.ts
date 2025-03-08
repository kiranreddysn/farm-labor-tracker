import { supabase } from "./supabase";
import { Worker } from "@/components/workers/WorkerCard";

import { isCurrentWeek } from "./date-utils";

// Worker API functions
export async function fetchWorkers(): Promise<Worker[]> {
  try {
    // First get all workers
    const { data: workers, error: workersError } = await supabase
      .from("workers")
      .select("*");

    if (workersError) throw workersError;
    if (!workers) return [];

    // Then get all shifts
    const { data: shifts, error: shiftsError } = await supabase
      .from("shifts")
      .select("*");

    if (shiftsError) throw shiftsError;

    // Then get all payments
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*");

    if (paymentsError) throw paymentsError;

    // Process the data to calculate hours this week and pending payments
    return workers.map((worker) => {
      // Calculate hours this week
      const workerShifts =
        shifts?.filter((shift) => shift.worker_id === worker.id) || [];
      const hoursThisWeek = workerShifts
        .filter((shift) => isCurrentWeek(shift.shift_date))
        .reduce((total, shift) => total + Number(shift.hours), 0);

      // Calculate total earnings from all shifts
      const totalEarnings = workerShifts.reduce(
        (total, shift) => total + Number(shift.total_amount),
        0,
      );

      // Calculate total payments
      const workerPayments =
        payments?.filter((payment) => payment.worker_id === worker.id) || [];
      const totalPayments = workerPayments.reduce(
        (total, payment) => total + Number(payment.amount),
        0,
      );

      // Calculate pending payment (ensure it's never negative)
      const pendingPayment = Math.max(0, totalEarnings - totalPayments);

      return {
        id: worker.id,
        name: worker.name,
        status: worker.status,
        hoursThisWeek,
        pendingPayment,
        avatarUrl: worker.avatar_url,
      };
    });
  } catch (error) {
    console.error("Error in fetchWorkers:", error);
    return [];
  }
}

export async function createWorker(
  worker: Omit<Worker, "id" | "hoursThisWeek" | "pendingPayment">,
): Promise<Worker | null> {
  const { data, error } = await supabase
    .from("workers")
    .insert({
      name: worker.name,
      status: worker.status,
      avatar_url: worker.avatarUrl,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating worker:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    status: data.status,
    hoursThisWeek: 0,
    pendingPayment: 0,
    avatarUrl: data.avatar_url,
  };
}

export async function updateWorker(
  id: string,
  worker: Omit<Worker, "id" | "hoursThisWeek" | "pendingPayment">,
): Promise<boolean> {
  const { error } = await supabase
    .from("workers")
    .update({
      name: worker.name,
      status: worker.status,
      avatar_url: worker.avatarUrl,
      updated_at: new Date(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating worker:", error);
    return false;
  }

  return true;
}

export async function deleteWorker(id: string): Promise<boolean> {
  // First delete all related shifts and payments
  try {
    // Delete shifts
    const { error: shiftsError } = await supabase
      .from("shifts")
      .delete()
      .eq("worker_id", id);

    if (shiftsError) throw shiftsError;

    // Delete payments
    const { error: paymentsError } = await supabase
      .from("payments")
      .delete()
      .eq("worker_id", id);

    if (paymentsError) throw paymentsError;

    // Delete worker
    const { error: workerError } = await supabase
      .from("workers")
      .delete()
      .eq("id", id);

    if (workerError) throw workerError;

    return true;
  } catch (error) {
    console.error("Error deleting worker:", error);
    return false;
  }
}

// Shift API functions
export async function createShift(shift: {
  workerId: string;
  hours: number;
  hourlyRate: number;
  totalAmount: number;
  date: string;
  notes: string;
}): Promise<boolean> {
  const { error } = await supabase.from("shifts").insert({
    worker_id: shift.workerId,
    hours: shift.hours,
    hourly_rate: shift.hourlyRate,
    total_amount: shift.totalAmount,
    shift_date: shift.date,
    notes: shift.notes,
  });

  if (error) {
    console.error("Error creating shift:", error);
    return false;
  }

  return true;
}

// Payment API functions
export async function createPayment(payment: {
  workerId: string;
  amount: number;
  date: string;
  notes: string;
}): Promise<boolean> {
  const { error } = await supabase.from("payments").insert({
    worker_id: payment.workerId,
    amount: payment.amount,
    payment_date: payment.date,
    notes: payment.notes,
  });

  if (error) {
    console.error("Error creating payment:", error);
    return false;
  }

  return true;
}

// History API functions
export async function fetchWorkerShifts(workerId: string) {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("worker_id", workerId)
    .order("shift_date", { ascending: false });

  if (error) {
    console.error("Error fetching worker shifts:", error);
    return [];
  }

  return data || [];
}

export async function fetchWorkerPayments(workerId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("worker_id", workerId)
    .order("payment_date", { ascending: false });

  if (error) {
    console.error("Error fetching worker payments:", error);
    return [];
  }

  return data || [];
}

// Report API functions
export async function fetchAllShifts() {
  const { data, error } = await supabase
    .from("shifts")
    .select("*, workers(name)")
    .order("shift_date", { ascending: false });

  if (error) {
    console.error("Error fetching all shifts:", error);
    return [];
  }

  return data || [];
}

export async function fetchAllPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select("*, workers(name)")
    .order("payment_date", { ascending: false });

  if (error) {
    console.error("Error fetching all payments:", error);
    return [];
  }

  return data || [];
}
