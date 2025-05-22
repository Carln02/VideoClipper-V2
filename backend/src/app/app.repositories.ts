import {MongoClient, ServerApiVersion, Db} from "mongodb";
import {UserRepository} from "../user/user.repository";
import {GroupRepository} from "../group/group.repository";
import {ProjectRepository} from "../project/project.repository";
import {MediaRepository} from "../media/media.repository";

export class AppRepositories {
    private readonly uri: string = process.env.MONGODB_URI!;

    private client?: MongoClient;
    private db?: Db;

    private _mediaRepository?: MediaRepository;
    private _userRepository?: UserRepository;
    private _groupRepository?: GroupRepository;
    private _projectRepository?: ProjectRepository;

    public constructor(private readonly MEDIA_PATH: string) {}

    public async initialize(): Promise<void> {
        if (this.client) return;

        this.client = new MongoClient(this.uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        try {
            await this.client.connect();
            this.db = this.client.db("clipper");

            this._mediaRepository = new MediaRepository(this.MEDIA_PATH, this);
            this._userRepository = new UserRepository(this.db.collection("Users"), this);
            this._groupRepository = new GroupRepository(this.db.collection("Groups"), this);
            this._projectRepository = new ProjectRepository(this.db.collection("Projects"), this);

            console.log("✅ Repositories initialized");
        } catch (err) {
            console.error("❌ Failed to connect:", err);
        }
    }

    public get mediaRepository(): MediaRepository {
        if (!this._mediaRepository) throw new Error("MediaRepository not ready");
        return this._mediaRepository;
    }

    public get userRepository(): UserRepository {
        if (!this._userRepository) throw new Error("UserRepository not ready");
        return this._userRepository;
    }

    public get groupRepository(): GroupRepository {
        if (!this._groupRepository) throw new Error("GroupRepository not ready");
        return this._groupRepository;
    }

    public get projectRepository(): ProjectRepository {
        if (!this._projectRepository) throw new Error("ProjectRepository not ready");
        return this._projectRepository;
    }

    public async closeConnection(): Promise<void> {
        if (!this.client) return;
        try {
            await this.client.close();
            console.log("🔌 MongoDB connection closed");
        } catch (err) {
            console.error("❌ Error closing connection:", err);
        }
    }
}