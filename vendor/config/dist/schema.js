const dashboardConfigSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://schemas.nesolagus.com/dashboard-config.json',
  title: 'Nesolagus Dashboard Configuration',
  description: 'Defines widgets, filters, and layout metadata for Nesolagus client dashboards.',
  type: 'object',
  additionalProperties: false,
  required: ['version', 'widgets'],
  properties: {
    version: {
      type: 'string',
      description: 'Semantic version for the dashboard configuration.'
    },
    surveyId: {
      type: 'string',
      description: 'Optional survey identifier this dashboard references.'
    },
    metadata: {
      type: 'object',
      additionalProperties: false,
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        createdBy: { type: 'string' },
        tags: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    },
    layout: {
      type: 'object',
      additionalProperties: false,
      properties: {
        columns: {
          type: 'integer',
          minimum: 1,
          maximum: 24,
          default: 12
        },
        gap: {
          type: 'integer',
          minimum: 0,
          default: 24
        }
      }
    },
    filters: {
      type: 'array',
      description: 'Dashboard-level filters end users can apply.',
      items: { $ref: '#/definitions/filter' }
    },
    widgets: {
      type: 'array',
      minItems: 0,
      description: 'Collection of widgets displayed on the dashboard.',
      items: { $ref: '#/definitions/widget' }
    },
    dataSources: {
      type: 'object',
      additionalProperties: { $ref: '#/definitions/dataSource' },
      description: 'Reusable data source definitions referenced by widgets.'
    }
  },
  definitions: {
    layoutItem: {
      type: 'object',
      additionalProperties: false,
      required: ['x', 'y', 'w', 'h'],
      properties: {
        x: { type: 'integer', minimum: 0 },
        y: { type: 'integer', minimum: 0 },
        w: { type: 'integer', minimum: 1, maximum: 24 },
        h: { type: 'integer', minimum: 1, maximum: 24 },
        minW: { type: 'integer', minimum: 1, maximum: 24 },
        minH: { type: 'integer', minimum: 1, maximum: 24 }
      }
    },
    filter: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'type', 'label', 'source'],
      properties: {
        id: {
          type: 'string',
          pattern: '^[a-zA-Z0-9_-]+$'
        },
        type: {
          type: 'string',
          enum: ['select', 'multi-select', 'date-range', 'cohort', 'custom']
        },
        label: { type: 'string' },
        source: {
          type: 'object',
          additionalProperties: false,
          required: ['kind', 'value'],
          properties: {
            kind: {
              type: 'string',
              enum: ['variable', 'block', 'metadata']
            },
            value: { type: 'string' }
          }
        },
        defaultValue: {},
        options: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['value', 'label'],
            properties: {
              value: {},
              label: { type: 'string' }
            }
          }
        }
      }
    },
    dataSource: {
      type: 'object',
      additionalProperties: false,
      required: ['kind', 'ref'],
      properties: {
        kind: {
          type: 'string',
          enum: ['question', 'variable', 'metric']
        },
        ref: { type: 'string' },
        aggregation: {
          type: 'string',
          enum: ['count', 'sum', 'avg', 'min', 'max', 'median', 'distribution', 'percentage']
        },
        groupBy: {
          type: 'object',
          additionalProperties: false,
          properties: {
            kind: { type: 'string', enum: ['variable', 'block', 'choice'] },
            value: { type: 'string' }
          }
        },
        filters: {
          type: 'array',
          items: { $ref: '#/definitions/filter' }
        }
      }
    },
    widget: {
      type: 'object',
      required: ['id', 'type', 'title', 'layout', 'data'],
      additionalProperties: false,
      properties: {
        id: {
          type: 'string',
          pattern: '^[a-zA-Z0-9_-]+$'
        },
        accent: {
          type: 'string',
          description: 'Accent palette key or custom color token'
        },
        type: {
          type: 'string',
          enum: ['metric', 'chart', 'table', 'text', 'custom']
        },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        description: { type: 'string' },
        layout: { $ref: '#/definitions/layoutItem' },
        data: {
          oneOf: [
            { $ref: '#/definitions/widgetDataBinding' },
            {
              type: 'array',
              items: { $ref: '#/definitions/widgetDataBinding' },
              minItems: 1
            }
          ]
        },
        presentation: {
          type: 'object',
          additionalProperties: false,
          properties: {
            chart: {
              type: 'object',
              additionalProperties: false,
              properties: {
                variant: {
                  type: 'string',
                  enum: ['line', 'bar', 'stacked-bar', 'pie', 'donut']
                },
                stacking: {
                  type: 'string',
                  enum: ['none', 'normal', 'percent']
                },
                showLegend: { type: 'boolean' },
                showValues: { type: 'boolean' }
              }
            },
            metric: {
              type: 'object',
              additionalProperties: false,
              properties: {
                format: {
                  type: 'string',
                  enum: ['number', 'percentage', 'currency', 'duration', 'custom']
                },
                precision: { type: 'integer', minimum: 0, maximum: 6 },
                comparison: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    baseline: {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        type: {
                          type: 'string',
                          enum: ['previous-period', 'previous-response', 'custom']
                        },
                        value: {}
                      }
                    },
                    format: { type: 'string', enum: ['delta', 'percentage'] }
                  }
                }
              }
            },
            table: {
              type: 'object',
              additionalProperties: false,
              properties: {
                columns: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['key', 'label'],
                    properties: {
                      key: { type: 'string' },
                      label: { type: 'string' },
                      width: { type: 'integer', minimum: 80, maximum: 600 },
                      format: { type: 'string', enum: ['text', 'number', 'percentage', 'currency', 'duration'] }
                    }
                  }
                },
                pagination: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    pageSize: { type: 'integer', minimum: 5, maximum: 100, default: 25 },
                    showTotal: { type: 'boolean', default: true }
                  }
                }
              }
            }
          }
        },
        notes: { type: 'string' }
      }
    },
    widgetDataBinding: {
      type: 'object',
      additionalProperties: false,
      required: ['source'],
      properties: {
        id: {
          type: 'string',
          pattern: '^[a-zA-Z0-9_-]+$'
        },
        label: { type: 'string' },
        source: {
          type: 'object',
          additionalProperties: false,
          required: ['kind', 'value'],
          properties: {
            kind: {
              type: 'string',
              enum: ['question', 'variable', 'metric', 'calculation']
            },
            value: { type: 'string' }
          }
        },
        aggregation: {
          type: 'string',
          enum: ['count', 'sum', 'avg', 'min', 'max', 'median', 'distribution', 'percentage']
        },
        filters: {
          type: 'array',
          items: { $ref: '#/definitions/filter' }
        },
        groupBy: {
          type: 'object',
          additionalProperties: false,
          properties: {
            kind: { type: 'string', enum: ['variable', 'block', 'choice'] },
            value: { type: 'string' },
            limit: { type: 'integer', minimum: 1, maximum: 100 }
          }
        },
        sort: {
          type: 'object',
          additionalProperties: false,
          properties: {
            direction: { type: 'string', enum: ['asc', 'desc'] },
            by: { type: 'string', enum: ['value', 'label'] }
          }
        }
      }
    }
  }
};

module.exports = {
  dashboardConfigSchema
};
