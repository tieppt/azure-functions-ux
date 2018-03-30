export interface AIMonthlySummary {
    successCount: number;
    failedCount: number;
}

export interface AIInvocationTrace {
    timestamp: string;
    id: string;
    name: string;
    success: string;
    resultCode: string;
    duration: number;
    operationId: string;
}