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
