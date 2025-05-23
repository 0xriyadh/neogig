const logger = {
    info: (message: string, ...args: any[]) => {
        console.log(`[${new Date().toISOString()}] INFO:`, message, ...args);
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(`[${new Date().toISOString()}] WARN:`, message, ...args);
    },
    error: (message: string, ...args: any[]) => {
        console.error(`[${new Date().toISOString()}] ERROR:`, message, ...args);
    }
};

export default logger;