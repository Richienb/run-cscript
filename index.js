"use strict"

const execa = require("execa")
const commandExists = require("command-exists")
const fs = require("fs-extra")
const { default: ow } = require("ow")
const { default: is } = require("@sindresorhus/is")

module.exports = async (input, { interactive = false, timeout = Infinity, host = "wscript", logo = false, unicode = true, cwd = process.cwd() } = {}) => {
	if (process.platform !== "win32") throw new Error("Windows is required!")
	if (!(await commandExists("cscript"))) throw new Error("`cscript` not found!")

	ow(input, ow.string)
	ow(interactive, ow.boolean)
	ow(timeout, ow.number.integerOrInfinite)
	ow(host, ow.string.matches(/cscript|wscript/))
	ow(logo, ow.boolean)
	ow(unicode, ow.boolean)
	ow(cwd, ow.string)

	const args = [input, interactive ? "//I" : "//B", host === "cscript" ? "//H:CScript" : "//H:WScript", logo ? "//Logo" : "//Nologo"]

	if (is.number(timeout) && !is.infinite(timeout)) args.push(`//T:${timeout}`)
	if (unicode) args.push("//U")

	const options = {
		cwd
	}

	if (is.number(timeout) && !is.infinite(timeout)) options.timeout = timeout

	const { stdout } = await execa("cscript", args, options)

	return stdout
}
