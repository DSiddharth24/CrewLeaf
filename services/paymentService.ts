import RazorpayCheckout from 'react-native-razorpay';
import ENV from '../config/env';

export interface PaymentOptions {
    amount: number; // in paise (100 paise = 1 rupee)
    currency?: string;
    name: string;
    description: string;
    orderId?: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
}

export interface PaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

/**
 * Initiate Razorpay payment
 * @param options Payment options
 * @returns Promise with payment response
 */
export const initiatePayment = async (
    options: PaymentOptions
): Promise<PaymentResponse> => {
    try {
        const data = await RazorpayCheckout.open({
            key: ENV.RAZORPAY_KEY_ID,
            amount: options.amount,
            currency: options.currency || 'INR',
            name: options.name,
            description: options.description,
            order_id: options.orderId,
            prefill: options.prefill || {},
            notes: options.notes || {},
            theme: {
                color: '#2D5F3F', // CrewLeaf primary color
            },
        });

        return data as PaymentResponse;
    } catch (error: any) {
        throw new Error(error.description || 'Payment failed');
    }
};

/**
 * Convert rupees to paise
 * @param rupees Amount in rupees
 * @returns Amount in paise
 */
export const rupeesToPaise = (rupees: number): number => {
    return Math.round(rupees * 100);
};

/**
 * Convert paise to rupees
 * @param paise Amount in paise
 * @returns Amount in rupees
 */
export const paiseToRupees = (paise: number): number => {
    return paise / 100;
};

/**
 * Example usage for paying wages
 */
export const payWage = async (
    workerName: string,
    amount: number,
    workerId: string,
    workerEmail?: string,
    workerContact?: string
): Promise<PaymentResponse> => {
    const paymentOptions: PaymentOptions = {
        amount: rupeesToPaise(amount),
        name: 'CrewLeaf Wage Payment',
        description: `Wage payment for ${workerName}`,
        prefill: {
            name: workerName,
            email: workerEmail,
            contact: workerContact,
        },
        notes: {
            workerId: workerId,
            paymentType: 'wage',
        },
    };

    return await initiatePayment(paymentOptions);
};
