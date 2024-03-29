/**
 * typeorm基础orm类
 * @github: https://github.com/typeorm/typeorm
 */
import { Context, Service } from 'egg';
import { createConnections, Connection, BaseEntity, ObjectType, Repository, FindManyOptions, getConnectionManager, FindOneOptions, FindConditions } from "typeorm";

/**
 * 继承自egg的Service，
 * 对typeorm的更低级的封装
 */
export class BaseService extends Service {
    
    /**
     * 基础DB服务
     * @param ctx egg  的context
     * @param modelType 当前关联的model
     */
    constructor(ctx: Context, modelType?: ObjectType<BaseEntity>, dbName: string = 'default') {
        super(ctx);
        if(modelType) {
            this.modelType = modelType;
        }
        if(dbName) {
            this.dbName = dbName;
        }
    }    

    /**
     * 当前绑定的基础类型
     */
    public modelType?: ObjectType<BaseEntity>;

    /**
     * db配置名称
     */
    public dbName?: string = 'default';

    /**
     * 默认库
     * 在config.mysql.clients中配置的default库
     */
    public async defaultDB(): Promise<Connection> {
        let conn = await this.getConnection(this.dbName);
        return conn;
    }

    /**
     * 通过配置名获取DB连接信息
     * @param name config的mysql.clients中的配置key
     */
    public async getConnection(name: string|Connection = 'default'): Promise<Connection> {
        if(typeof name !== 'string') return name;
        let manager = getConnectionManager();
        // 如果已经存在连接，并且active，直接返回
        if(manager.has(name)) {
            let conn = manager.get(name);
            if(!conn.isConnected) return await conn.connect();
            return conn;
        }

        await createConnections(this.config.mysql.clients);        
        if(manager.has(name)) {
            return manager.get(name);
        }
        else {
            throw Error(`config.mysql.clients 中不存在${name}的配置`);
        }
    }

    /**
     * 获取typeorm 的 Repository
     * https://typeorm.io/#/repository-api
     */
    public async getRespository<T extends BaseEntity>(db: string | Connection = 'default', type: ObjectType<T> = this.modelType): Promise<Repository<T>> {
        db = await this.getConnection(db);
        let res = db.getRepository<T>(type);
        return res;
    }    
}

/**
 * 继承自BaseService
 * 针对model 一对一的DB orm操作
 */
export default class BaseTypeService<T extends BaseEntity> extends BaseService {
    
    /**
     * 基础DB服务
     * @param ctx egg  的context
     * @param modelType 当前关联的model
     */
    constructor(ctx: Context, modelType?: ObjectType<T>, dbName: string = 'default') {
        super(ctx, modelType, dbName);
    }

    /**
     * 接口文档： https://typeorm.io/#/find-options
     * userRepository.find({ where: { firstName: "Timber", lastName: "Saw" } });
     * or: userRepository.find({
        where: [
            { firstName: "Timber", lastName: "Saw" },
            { firstName: "Stan", lastName: "Lee" }
        ],
        order: {
            name: "ASC",
            id: "DESC"
        },
        skip: 5,
        take: 10
        });
     * userRepository.find({ 
            join: {
                alias: "user",
                leftJoinAndSelect: {
                    profile: "user.profile",
                    photo: "user.photos",
                    video: "user.videos"
                }
            }
        });
        https://typeorm.io/#/find-options
     * @param options {FindManyOptions<T>} 查找参数
     */
    public async find(options?: FindManyOptions<T>, db: string|Connection = 'default', type: ObjectType<T> = this.modelType): Promise<T[]> {
        let res = await this.getRespository(db, type);
        let data = await res.find(options); 
        return data;
    }

    /**
     * 获取第一条符合的model对象
     * @param options {FindOneOptions<T>} 查询条件，例如: {id:1}
     * @param db 数据库
     * @param type model类型
     */
    async get(options?: FindOneOptions<T> |string | number | Date, db?: string|Connection, type?: ObjectType<T>): Promise<T> {
        let res = await this.getRespository(db, type);
        if(typeof options == 'object') {
            return await res.findOne(options as FindOneOptions<T>);
        }
        else {
            return await res.findOne(options);
        }
    }

    /**
     * 获取当前表所有数据
     * @param db 访问DB，默认为default
     * @param type 当前查询的model类型
     */
    public async getAll(db: string|Connection = 'default', type: ObjectType<T> = this.modelType): Promise<T[]> {
        return await this.find({}, db, type);
    }

    /**
     * 修改或新增
     * @param data model对象
     * @param db 数据库
     */
    public async save(data: T, db: string|Connection = 'default'): Promise<T> {
        let res = await this.getRespository(db);
        return res.save(data);
    }

    /**
     * 删除某条记录
     * @param data 需要删除的对象
     * @param db DB
     */
    public async remove(data: T, db: string|Connection = 'default'): Promise<T> {
        let res = await this.getRespository<T>(db);
        return res.remove(data);
    }
}