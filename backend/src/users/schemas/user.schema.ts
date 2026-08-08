import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, sparse: true })
  email!: string;

  @Prop()
  password?: string;

  @Prop({ default: false })
  isGuest!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Strip sensitive/internal fields from every JSON response (res.json / JSON.stringify)
// so the password hash and __v never leak through the API, no matter which
// controller returns the document.
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const sanitized = ret as unknown as Record<string, unknown>;
    delete sanitized.password;
    delete sanitized.__v;
    return sanitized;
  },
});
