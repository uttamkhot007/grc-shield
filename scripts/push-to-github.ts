import { getUncachableGitHubClient } from '../server/lib/github';
import * as fs from 'fs';
import * as path from 'path';

const REPO_NAME = 'grc-shield';

async function getAllFiles(dir: string, baseDir: string = dir): Promise<{ path: string; content: string }[]> {
  const files: { path: string; content: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  const ignoreDirs = ['node_modules', '.git', 'dist', '.cache', '.config', '.upm', 'attached_assets'];
  const ignoreFiles = ['.replit', 'replit.nix', '.gitignore'];
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name) && !entry.name.startsWith('.')) {
        files.push(...await getAllFiles(fullPath, baseDir));
      }
    } else {
      if (!ignoreFiles.includes(entry.name) && !entry.name.endsWith('.log')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          files.push({ path: relativePath, content });
        } catch (e) {
          console.log('Skipping binary/unreadable file:', relativePath);
        }
      }
    }
  }
  
  return files;
}

async function main() {
  try {
    const octokit = await getUncachableGitHubClient();
    const { data: user } = await octokit.users.getAuthenticated();
    console.log('Authenticated as:', user.login);
    
    let repoExists = false;
    try {
      await octokit.repos.get({ owner: user.login, repo: REPO_NAME });
      repoExists = true;
      console.log('Repository already exists:', REPO_NAME);
    } catch (e: any) {
      if (e.status === 404) {
        console.log('Creating repository:', REPO_NAME);
        await octokit.repos.createForAuthenticatedUser({
          name: REPO_NAME,
          description: 'GRC Shield - Enterprise Governance, Risk & Compliance Platform with AI-powered insights',
          private: false,
          auto_init: true
        });
        console.log('Repository created successfully');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw e;
      }
    }
    
    console.log('Getting repository info...');
    const { data: repo } = await octokit.repos.get({ owner: user.login, repo: REPO_NAME });
    
    let sha: string | undefined;
    try {
      const { data: ref } = await octokit.git.getRef({
        owner: user.login,
        repo: REPO_NAME,
        ref: 'heads/main'
      });
      sha = ref.object.sha;
    } catch (e) {
      console.log('No main branch yet, will create initial commit');
    }
    
    console.log('Collecting files...');
    const files = await getAllFiles('/home/runner/workspace');
    console.log(`Found ${files.length} files to upload`);
    
    const blobs: { path: string; sha: string }[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (i % 50 === 0) {
        console.log(`Creating blobs: ${i}/${files.length}`);
      }
      try {
        const { data: blob } = await octokit.git.createBlob({
          owner: user.login,
          repo: REPO_NAME,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64'
        });
        blobs.push({ path: file.path, sha: blob.sha });
      } catch (e: any) {
        console.log('Error creating blob for:', file.path, e.message);
      }
    }
    
    console.log(`Created ${blobs.length} blobs, creating tree...`);
    
    const { data: tree } = await octokit.git.createTree({
      owner: user.login,
      repo: REPO_NAME,
      tree: blobs.map(b => ({
        path: b.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: b.sha
      })),
      base_tree: sha
    });
    
    console.log('Creating commit...');
    const { data: commit } = await octokit.git.createCommit({
      owner: user.login,
      repo: REPO_NAME,
      message: 'GRC Shield - Enterprise Governance, Risk & Compliance Platform\n\nFeatures:\n- Multi-tenant architecture\n- AI-powered compliance insights\n- Risk management\n- Security scanning engines\n- 3D glassmorphism UI\n- Scalability infrastructure',
      tree: tree.sha,
      parents: sha ? [sha] : []
    });
    
    console.log('Updating main branch...');
    try {
      await octokit.git.updateRef({
        owner: user.login,
        repo: REPO_NAME,
        ref: 'heads/main',
        sha: commit.sha,
        force: true
      });
    } catch (e) {
      await octokit.git.createRef({
        owner: user.login,
        repo: REPO_NAME,
        ref: 'refs/heads/main',
        sha: commit.sha
      });
    }
    
    console.log('\n✅ Successfully pushed to GitHub!');
    console.log(`📁 Repository: https://github.com/${user.login}/${REPO_NAME}`);
    
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

main();
