import {
	IExecuteFunctions,
	IHttpRequestMethods,
} from 'n8n-workflow';

import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class VspcApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'VSPC API',
		name: 'vspcApi',
		icon: 'file:vspc.svg',
		group: ['transform'],
		version: 1,
		description: 'Interacts with the Veeam Service Provider Console (VSPC) API',
		defaults: {
			name: 'VSPC API',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'vspcApiCredentials-Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Endpoint',
				name: 'endpoint',
				type: 'options',
				options: [
					{ name: 'Active Alarms', value: 'activeAlarms' },
					{ name: 'Backup Jobs', value: 'backupJobs' },
					{ name: 'Company', value: 'company' },
					{ name: 'Management Agents', value: 'managementAgents' },
					{ name: 'Tenant Products', value: 'tenantProducts' },
					{ name: 'VB365 Organization Jobs', value: 'vb365OrganizationJobs' },
				],
				default: 'backupJobs',
				description: 'Choose the VSPC API endpoint to interact with',
				noDataExpression: true,
			},

			{
				displayName: 'Company UID',
				name: 'companyUid',
				type: 'string',
				displayOptions: {
					show: {
						endpoint: ['company'],
					},
				},
				default: '',
				description: 'UID of the company to retrieve information for',
				required: true,
			},

			{
				displayName: 'Query Options',
				name: 'queryOptions',
				type: 'collection',
				placeholder: 'Add Option',
				displayOptions: {
					show: {
						endpoint: [
							'backupJobs',
							'managementAgents',
							'vb365OrganizationJobs',
							'tenantProducts',
							'activeAlarms',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 50,
						description: 'Max number of results to return',
					},
					{
						displayName: 'Offset',
						name: 'offset',
						type: 'number',
						default: 0,
						description: 'Offset for pagination',
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'string',
						default: '',
						description: 'Sort criteria',
					},
					{
						displayName: 'Filter',
						name: 'filter',
						type: 'string',
						default: '',
						description: 'Filter criteria for the request',
					},
					{
						displayName: 'Select',
						name: 'select',
						type: 'string',
						default: '',
						description: 'Explicitly requested properties (comma-separated)',
					},
				],
			},

			{
				displayName: 'Company Options',
				name: 'companyOptions',
				type: 'collection',
				placeholder: 'Add Option',
				displayOptions: {
					show: {
						endpoint: ['company'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Select',
						name: 'select',
						type: 'string',
						default: '',
						description: 'Explicitly requested properties (comma-separated)',
					},
				],
			},

			{
				displayName: 'Request Options',
				name: 'requestOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Ignore SSL Issues',
						name: 'ignoreSslIssues',
						type: 'boolean',
						default: false,
						description: 'Whether to ignore SSL certificate validation issues',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('vspcApiCredentials-Api') as { baseUrl: string, token: string };

		for (let i = 0; i < items.length; i++) {
			const endpoint = this.getNodeParameter('endpoint', i) as string;
			const reqOpts = this.getNodeParameter('requestOptions', i, {}) as { ignoreSslIssues?: boolean };
			const ignoreSslIssues = reqOpts.ignoreSslIssues === true;

			let apiUrl = `${credentials.baseUrl.replace(/\/$/, '')}/api/v3`;

			if (endpoint === 'company') {
				const companyUid = this.getNodeParameter('companyUid', i) as string;
				const companyOptions = this.getNodeParameter('companyOptions', i, {}) as { select?: string };

				if (!companyUid) {
					throw new NodeOperationError(this.getNode(), 'Company UID must be provided for the Company endpoint');
				}

				apiUrl += `/organizations/companies/${companyUid}`;

				const qs: Record<string, string> = {};
				if (companyOptions.select) qs.select = companyOptions.select;

				const requestOptions = {
					method: 'GET' as IHttpRequestMethods,
					uri: apiUrl,
					qs,
					headers: {
						Authorization: `Bearer ${credentials.token}`,
						'Content-Type': 'application/json',
					},
					json: true,
					agentOptions: {
						rejectUnauthorized: !ignoreSslIssues,
					},
				};

				try {
					const responseData = await this.helpers.requestWithAuthentication.call(this, 'vspcApiCredentials-Api', requestOptions);
					returnData.push({ json: responseData });
				} catch (error: any) {
					throw new NodeOperationError(this.getNode(), `VSPC API request failed for Company UID ${companyUid}: ${error.message}`);
				}
			}

			else {
				const queryOptions = this.getNodeParameter('queryOptions', i, {}) as {
					limit?: number;
					offset?: number;
					sort?: string;
					filter?: string;
					select?: string;
				};

				if (endpoint === 'backupJobs') {
					apiUrl += `/infrastructure/backupServers/jobs`;
				} else if (endpoint === 'managementAgents') {
					apiUrl += `/infrastructure/managementAgents`;
				} else if (endpoint === 'vb365OrganizationJobs') {
					apiUrl += `/infrastructure/vb365Servers/organizations/jobs`;
				} else if (endpoint === 'tenantProducts') {
					apiUrl += `/infrastructure/sites/tenants/products`;
				} else if (endpoint === 'activeAlarms') {
					apiUrl += `/alarms/active`;
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown endpoint: ${endpoint}`);
				}
				const qs: Record<string, any> = {};
				qs.limit = typeof queryOptions.limit === 'number' ? queryOptions.limit : 500;
				if (typeof queryOptions.limit === 'number') qs.limit = queryOptions.limit;
				if (typeof queryOptions.offset === 'number') qs.offset = queryOptions.offset;
				if (queryOptions.sort) qs.sort = queryOptions.sort;
				if (queryOptions.filter) qs.filter = queryOptions.filter;
				if (queryOptions.select) qs.select = queryOptions.select;

				const requestOptions = {
					method: 'GET' as IHttpRequestMethods,
					qs,
					uri: apiUrl,
					headers: {
						Authorization: `Bearer ${credentials.token}`,
						'Content-Type': 'application/json',
					},
					json: true,
					agentOptions: {
						rejectUnauthorized: !ignoreSslIssues,
					},
				};

				try {
					const responseData = await this.helpers.requestWithAuthentication.call(this, 'vspcApiCredentials-Api', requestOptions);
					returnData.push({ json: responseData });
				} catch (error: any) {
					throw new NodeOperationError(this.getNode(), `VSPC API request failed: ${error.message}`);
				}
			}
		}

		return [returnData];
	}
}
