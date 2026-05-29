import * as z from "zod";

export const linkSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요").max(50, "제목은 50자 이내로 입력해주세요"),
  url: z
    .string()
    .min(1, "주소를 입력해주세요")
    .transform((val) => {
      let trimmed = val.trim();
      if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        trimmed = "https://" + trimmed;
      }
      return trimmed;
    })
    .pipe(
      z.string().url("올바른 URL 형식을 입력해주세요").refine(
        (val) => {
          try {
            const urlObj = new URL(val);
            // 최소한 도메인에 점(.)이 포함되어 있는지 확인하여 '아무거나' 입력을 방지
            return urlObj.hostname.includes('.');
          } catch {
            return false;
          }
        },
        { message: "올바른 URL 형식을 입력해주세요" }
      )
    ),
});

export type LinkFormValues = z.infer<typeof linkSchema>;

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Username은 2자 이상 입력해주세요")
    .max(20, "Username은 20자 이내로 입력해주세요")
    .regex(/^[a-z0-9_-]+$/, "Username은 영문 소문자, 숫자, 밑줄(_), 하이픈(-)만 사용 가능합니다"),
  name: z.string().trim().min(1, "이름을 입력해주세요").max(50, "이름은 50자 이내로 입력해주세요"),
  bio: z.string().trim().max(80, "소개글은 80자 이내로 입력해주세요").optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

