import { useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const columns = [
  {
    title: "测试编号",
    dataIndex: "test_case_id",
    key: "test_case_id",
    width: 130,
  },
  {
    title: "测试场景",
    dataIndex: "test_scenario",
    key: "test_scenario",
    width: 220,
  },
  {
    title: "前置条件",
    dataIndex: "preconditions",
    key: "preconditions",
    width: 260,
  },
  {
    title: "测试步骤",
    dataIndex: "test_steps",
    key: "test_steps",
    width: 300,
    render: (steps) => (
      <ol style={{ margin: 0, paddingLeft: 20 }}>
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    ),
  },
  {
    title: "测试数据",
    dataIndex: "test_data",
    key: "test_data",
    width: 220,
  },
  {
    title: "预期结果",
    dataIndex: "expected_result",
    key: "expected_result",
    width: 300,
  },
  {
    title: "预期状态码",
    dataIndex: "expected_status_code",
    key: "expected_status_code",
    width: 130,
  },
  {
    title: "实际状态码",
    dataIndex: "actual_status_code",
    key: "actual_status_code",
    width: 130,
    render: (value) => value ?? "尚未执行",
  },
  {
    title: "测试状态",
    dataIndex: "test_status",
    key: "test_status",
    width: 120,
    render: (status) => {
      if (!status) {
        return <Tag>尚未执行</Tag>;
      }

      return <Tag color={status === "Pass" ? "green" : "red"}>{status}</Tag>;
    },
  },
];

const uiTestColumns = [
  {
    title: "测试编号",
    dataIndex: "test_case_id",
    key: "test_case_id",
    width: 120,
  },
  {
    title: "测试类型",
    dataIndex: "test_type",
    key: "test_type",
    width: 150,
  },
  {
    title: "测试场景",
    dataIndex: "test_scenario",
    key: "test_scenario",
  },
  {
    title: "浏览器",
    dataIndex: "browser",
    key: "browser",
    width: 120,
  },
  {
    title: "预期状态码",
    dataIndex: "expected_status_code",
    key: "expected_status_code",
    width: 130,
  },
  {
    title: "实际状态码",
    dataIndex: "actual_status_code",
    key: "actual_status_code",
    width: 130,
    render: (value) => value ?? "未获取",
  },
  {
    title: "耗时",
    dataIndex: "duration_ms",
    key: "duration_ms",
    width: 100,
    render: (value) => `${value} ms`,
  },
  {
    title: "测试状态",
    dataIndex: "test_status",
    key: "test_status",
    width: 110,
    render: (status) => (
      <Tag color={status === "Pass" ? "green" : status === "Fail" ? "red" : "orange"}>
        {status}
      </Tag>
    ),
  },
];

function GenerateTestsPage() {
  const [requirement, setRequirement] = useState("");
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [executing, setExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState([]);
  const [uiExecuting, setUiExecuting] = useState(false);
  const [uiExecutionResults, setUiExecutionResults] = useState([]);
  const [uiSummary, setUiSummary] = useState(null);

  const handleGenerateTests = async () => {
    setExecutionResults([]);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/ai/generate-tests",
        {
          requirement: requirement.trim(),
        }
      );

      const generatedTestCases =
        response.data.generated_tests.test_cases;

      console.log("包含可执行字段的测试用例：", generatedTestCases);

      setTestCases(generatedTestCases);
      message.success("测试用例生成成功");
    } catch (error) {
      console.error("生成测试用例失败：", error);
      message.error("生成测试用例失败，请检查后端服务");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTests = async () => {
    setExecuting(true);
    setExecutionResults([]);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/tests/execute",
        {
          test_cases: testCases,
        }
      );

      const results = response.data.execution_results;

      console.log("测试执行结果：", results);
      setExecutionResults(results);
      message.success("自动化测试执行完成");
    } catch (error) {
      console.error("执行测试失败：", error);
      message.error("执行测试失败，请检查后端服务");
    } finally {
      setExecuting(false);
    }
  };

  const handleExecuteUiTests = async () => {
    setUiExecuting(true);
    setUiExecutionResults([]);
    setUiSummary(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/ui-tests/execute"
      );

      setUiExecutionResults(response.data.execution_results);
      setUiSummary(response.data.summary);
      message.success("UI 自动化测试执行完成");
    } catch (error) {
      console.error("执行 UI 测试失败：", error);
      message.error(
        error.response?.data?.message || "UI 测试执行失败，请检查后端服务"
      );
    } finally {
      setUiExecuting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: "40px auto", padding: "0 20px" }}>
      <Card>
        <Title level={2}>AI 测试用例生成</Title>

        <Paragraph>
          输入产品需求，AI 将自动生成对应的测试用例。
        </Paragraph>

        <TextArea
          rows={5}
          placeholder="例如：用户名至少需要6个字符"
          value={requirement}
          onChange={(event) => setRequirement(event.target.value)}
        />

        <Button
          type="primary"
          style={{ marginTop: 16 }}
          disabled={!requirement.trim()}
          loading={loading}
          onClick={handleGenerateTests}
        >
          生成测试用例
        </Button>
      </Card>

      {testCases.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <Title level={3}>生成结果</Title>
          <Button
            type="primary"
            loading={executing}
            disabled={testCases.length === 0}
            onClick={handleExecuteTests}
            style={{ marginBottom: 16 }}
          >
            执行测试
          </Button>
        
          <Table
            columns={columns}
            dataSource={executionResults.length > 0 ? executionResults : testCases}
            rowKey="test_case_id"
            pagination={false}
            bordered
            scroll={{ x: 1430 }}
          />
        </Card>
      )}

      <Card style={{ marginTop: 24 }}>
        <Title level={3}>UI 自动化测试</Title>
        <Paragraph>
          使用 Chromium 模拟用户打开注册页、输入 5 位用户名并提交，验证系统是否正确拒绝注册。
        </Paragraph>

        <Button
          type="primary"
          loading={uiExecuting}
          onClick={handleExecuteUiTests}
        >
          执行 UI 测试
        </Button>

        {uiSummary && (
          <Row gutter={16} style={{ marginTop: 24, marginBottom: 20 }}>
            <Col xs={12} sm={6}>
              <Statistic title="总用例" value={uiSummary.total} />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="通过"
                value={uiSummary.passed}
                valueStyle={{ color: "#389e0d" }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="失败"
                value={uiSummary.failed}
                valueStyle={{ color: "#cf1322" }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="执行错误"
                value={uiSummary.errors}
                valueStyle={{ color: "#d46b08" }}
              />
            </Col>
          </Row>
        )}

        {uiExecutionResults.length > 0 && (
          <Table
            columns={uiTestColumns}
            dataSource={uiExecutionResults}
            rowKey="test_case_id"
            pagination={false}
            bordered
            scroll={{ x: 1080 }}
            style={{ marginTop: uiSummary ? 0 : 24 }}
          />
        )}
      </Card>
    </div>
  );
}

export default GenerateTestsPage;
