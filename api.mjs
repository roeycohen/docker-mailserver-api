import shell from 'shelljs';

class ApiError extends Error
{
	constructor(message, statusCode, data)
	{
		super(message);
		this.statusCode = statusCode;
		this.data = data;
	}
}

export class Api
{
	constructor(dms_container_name)
	{
		this.dms_container_name = dms_container_name;
		if (process.env.DEFAULT_MAIL_DOMAIN?.includes('@'))
		{
			console.error('DEFAULT_MAIL_DOMAIN should not include @');
			process.exit(1);
		}
	}

	executeCommand(command)
	{
		command = `docker exec ${this.dms_container_name} setup ` + command;
		console.info(`Executing: ${command}`);
		const result = shell.exec(command, {silent: true});

		if (result.code !== 0)
		{
			console.error(`Error executing command: ${result.stderr}`);
			return {success: false, error: result.stderr, code: result.code};
		}

		return {success: true, output: result.stdout};
	}

	email_list()
	{
		const command = `email list`;
		const executionResult = this.executeCommand(command);

		if (!executionResult.success)
			throw new ApiError(`Failed to execute: ${command}.`, 500, executionResult.error?.trim());

		const emails = [];
		executionResult.output.split('\n').forEach(r =>
		{
			const m = r.match(/^\* ([^@]+@[^ ]+) (.*)$/);
			if (m)
				emails.push({email: m[1], quota: m[2]});
		});
		return emails;

	}

	email_add(email, password)
	{
		if (!email)
			throw new ApiError('Missing required field: email', 400)

		if (!password)
			throw new ApiError('Missing required field: password', 400)

		if (!email.includes('@') && process.env.DEFAULT_MAIL_DOMAIN)
			email += '@' + process.env.DEFAULT_MAIL_DOMAIN;

		const executionResult = this.executeCommand(`email add ${email} ${password}`);

		if (!executionResult.success)
			throw new ApiError(`Failed to execute: email add ${email}.`, 500, executionResult.error.trim());
	}

	email_update(email, password)
	{
		if (!email)
			throw new ApiError('Missing required field: email', 400)

		if (!password)
			throw new ApiError('Missing required field: password', 400)

		if (!email.includes('@') && process.env.DEFAULT_MAIL_DOMAIN)
			email += '@' + process.env.DEFAULT_MAIL_DOMAIN;

		const executionResult = this.executeCommand(`email update ${email} ${password}`);

		if (!executionResult.success)
			throw new ApiError(`Failed to execute: email update ${email}.`, 500, executionResult.error.trim());
	}

	email_del(email)
	{
		if (!email)
			throw new ApiError('Missing required field: email', 400)

		if (!email.includes('@') && process.env.DEFAULT_MAIL_DOMAIN)
			email += '@' + process.env.DEFAULT_MAIL_DOMAIN;

		const command = `email del ${email}`;
		const executionResult = this.executeCommand(command);

		if (!executionResult.success)
		{
			throw new ApiError(`Failed to execute: ${command}.`, 500, executionResult.error.trim());
		}
	}

	fail2ban_list_raw()
	{
		const command = `fail2ban`;
		const executionResult = this.executeCommand(command);

		if (!executionResult.success)
			throw new ApiError(`Failed to execute: ${command}.`, 500, executionResult.error?.trim());

		return [executionResult.output];
	}
}
