import fs from "fs"

export function loadJSON(filename) {
    const file = fs.readFileSync(filename, "utf8")
    return JSON.parse(file)
}
