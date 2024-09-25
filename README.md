# VSPC API - n8n Custom Node

This is a custom n8n node for interacting with the **Veeam Service Provider Console (VSPC)** API. It allows you to fetch data from various endpoints in the VSPC API, such as backup jobs, management agents, and organization companies.

## Features

- **Fetch Backup Jobs**: Retrieve a list of all backup jobs from VSPC.
- **Fetch Management Agents**: Retrieve a list of management agents from VSPC.
- **Fetch VB365 Organization Jobs**: Retrieve a list of all organization jobs from VB365 servers.
- **Fetch Company Information**: Retrieve detailed information about specific companies using their `companyUid`.

## Installation

To install this custom node in your n8n instance:

1. Clone this repository.
   ```bash
   git clone https://github.com/BuddiesD/n8n-nodes-vspc.git
