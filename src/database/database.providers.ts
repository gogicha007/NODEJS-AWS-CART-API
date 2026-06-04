import { DataSource } from "typeorm";

export const databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            const dataSource = new DataSource({
                type: 'postgres',
                host: process.env.RDS_PG_HOST,
                port: Number(process.env.RDS_PG_PORT) ?? 5432,
                username: process.env.RDS_PG_USERNAME,
                password: process.env.RDS_PG_PASSWORD,
                database: process.env.RDS_PG_DATABASE,
                synchronize: true
            })
            return dataSource.initialize()
        }
    }
]