import { HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserPayloadDto } from 'src/auth/dto/UserPayload.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private http: HttpService,
  ) {}

  async create(payload: UserPayloadDto): Promise<User> {
    const createdUser = new this.userModel(payload);
    return createdUser.save();
  }

  async findByUserId(userId: string): Promise<User | null> {
    const user = await this.userModel.findOne({ user_id: userId }).exec();
    if (!user) {
      return null;
    }
    return user;
  }

  async isUser(payload: UserPayloadDto): Promise<boolean> {
    const candidate: User | null = await this.findByUserId(payload.user_id);
    if (candidate) {
      const passwordEquals = await bcrypt.compare(
        payload.password,
        candidate.password,
      );
      return !!(candidate && passwordEquals);
    }
  }

  isEmailOrPhone(user_id: string): boolean {
    return this.isEmail(user_id) || this.isPhone(user_id);
  }

  isEmail(user_id: string): boolean {
    let arr = [];
    if (user_id.length > 5 && user_id.length < 16) {
      arr = user_id.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    }
    return !!arr;
  }

  isPhone(user_id: string): boolean {
    let arr = [];
    if (user_id.length >= 7 && user_id.length <= 13) {
      arr = user_id.match(/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g);
    }
    return !!arr;
  }

  async info(userId: string): Promise<any> {
    const user: User | null = await this.findByUserId(userId);
    if (this.isEmail(user.user_id)) {
      return {
        user_id: user.user_id,
        id_type: 'email',
      };
    }
    return {
      user_id: user.user_id,
      id_type: 'phone',
    };
  }

  async latency(): Promise<any> {
    const time = performance.now();
    await this.http.get('https://www.google.com/').toPromise();
    return { latency: Math.round(performance.now() - time) };
  }
}
