// config/index.ts
export const config = {
    TINKOFF: {
      TERMINAL_KEY: process.env.NEXT_PUBLIC_TINKOFF_TERMINAL_KEY || '',
      COMPANY_EMAIL: process.env.NEXT_PUBLIC_COMPANY_EMAIL || ''
    }
  };