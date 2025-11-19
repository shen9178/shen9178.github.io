// api/save.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { username, score } = req.body;

  const token = process.env.GITHUB_TOKEN; // 从环境变量读取，安全！
  const apiUrl = `https://api.github.com/repos/shen9178/shen9178.github.io/contents/survey-data.json`;

  try {
    // 获取现有数据
    const fileRes = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    let data = [];
    let sha = null;

    if (fileRes.ok) {
      const fileData = await fileRes.json();
      data = JSON.parse(atob(fileData.content.replace(/\s/g, '')));
      sha = fileData.sha;
    }

    data.push({ username, score, timestamp: new Date().toISOString() });

    const updatedContent = btoa(JSON.stringify(data, null, 2));

    const updateRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `新评分：${username} - ${score}分`,
        content: updatedContent,
        sha,
      }),
    });

    if (!updateRes.ok) throw new Error('GitHub 更新失败');

    res.status(200).json({ message: '保存成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}