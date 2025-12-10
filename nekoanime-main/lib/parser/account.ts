import * as cheerio from "cheerio"

export interface AccountInfo {
  avatar: string | undefined
  name: string
  email: string
  username: string
  sex: "male" | "female" | "unknown"
}

export function parseAccountInfo(html: string): AccountInfo {
  const $ = cheerio.load(html)

  const avatar = $(".profile-userpic img").attr("src")
  const name = $(".profile-usertitle-name").text().trim()
  const email = $("#email").attr("value") || ""
  const username = $("#hoten").attr("value") || ""
  
  let sex: AccountInfo["sex"] = "unknown"
  if ($("#male").attr("checked")) {
    sex = "male"
  } else if ($("#female").attr("checked")) {
    sex = "female"
  }

  return { avatar, name, email, username, sex }
}
