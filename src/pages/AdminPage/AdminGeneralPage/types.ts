export type AuthUserInfo = { email: string; verified: boolean; creationTime: string };
export type AuthUserInfos = Partial<Record<string, AuthUserInfo>>;
