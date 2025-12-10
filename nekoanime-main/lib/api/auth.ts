import { Md5 } from "ts-md5"
import { post, get } from "../logic/http"
import { C_URL } from "../constants"
import { parseAccountInfo, AccountInfo } from "../parser/account"

export async function login(email: string, password: string): Promise<AccountInfo & { cookie: string }> {
  // eslint-disable-next-line new-cap
  const password_md5 = Md5.hashAsciiStr(password)

  const { data: html, headers } = await post(
    `/account/login/?_fxRef=${C_URL}/account/info`,
    {
      email,
      password: "",
      password_md5,
      save_password: "1",
      submit: ""
    },
    {
      "Referer": C_URL + "/",
      "Origin": C_URL,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  )

  if (html.includes("user-name-text")) {
    const info = parseAccountInfo(html)
    // Extract set-cookie from headers.
    const headerObj = headers as Record<string, string>
    const cookie = headerObj?.["set-cookie"] || ""
    return { ...info, cookie }
  } else {
    throw new Error("Login failed")
  }
}

export async function getUser(cookie: string): Promise<AccountInfo & { cookie: string }> {
    const { data: html, headers } = await get("/account/info", {
        cookie
    })

     if (html.includes("user-name-text")) {
        const info = parseAccountInfo(html)
        const headerObj = headers as Record<string, string>
        const newCookie = headerObj?.["set-cookie"] || cookie
        return { ...info, cookie: newCookie }
    } else {
        throw new Error("Get user failed")
    }
}
