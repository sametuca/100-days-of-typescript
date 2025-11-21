import { userRepository } from '../src/repositories/user.repository';
import { taskRepository } from '../src/repositories/task.repository';
import { commentService } from '../src/services/comment.service';
import { activityService } from '../src/services/activity.service';
import { TaskService } from '../src/services/task.service';
import { TaskStatus, TaskPriority } from '../src/types';
import { UserRole } from '../src/types';

const verifyDay24 = async () => {
    console.log('🚀 Starting Day 24 Verification...');

    try {
        // 1. Create a test user
        console.log('\n1. Creating test user...');
        const user = await userRepository.create({
            email: `test${Date.now()}@example.com`,
            username: `testuser${Date.now()}`,
            passwordHash: 'hashedpassword',
            firstName: 'Test',
            lastName: 'User',
            role: UserRole.USER
        });
        console.log(`✅ User created: ${user.id}`);

        // 2. Create a test task
        console.log('\n2. Creating test task...');
        const task = await TaskService.createTask({
            title: 'Test Task for Collaboration',
            description: 'Testing comments and activity logs',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM
        }, user.id);
        console.log(`✅ Task created: ${task.id}`);

        // 3. Update task status (should log activity)
        console.log('\n3. Updating task status...');
        await TaskService.updateTask(task.id, {
            status: TaskStatus.IN_PROGRESS
        }, user.id);
        console.log('✅ Task status updated');

        // 4. Add a comment (should log activity)
        console.log('\n4. Adding a comment...');
        const comment = await commentService.createComment(task.id, user.id, {
            content: 'This is a test comment'
        });
        console.log(`✅ Comment added: ${comment.id}`);

        // 5. Get task history
        console.log('\n5. Retrieving task history...');
        const history = await activityService.getTaskHistory(task.id);
        console.log(`Found ${history.length} activity logs`);
        history.forEach(log => {
            console.log(`- [${log.action_type}] ${JSON.stringify(log.details)}`);
        });

        if (history.length >= 2) {
            console.log('✅ Activity logs verified (Status Change + Comment Added)');
        } else {
            console.error('❌ Missing activity logs!');
        }

        // 6. Get task comments
        console.log('\n6. Retrieving task comments...');
        const comments = await commentService.getTaskComments(task.id);
        console.log(`Found ${comments.length} comments`);
        if (comments.length > 0 && comments[0].content === 'This is a test comment') {
            console.log('✅ Comments verified');
        } else {
            console.error('❌ Comments verification failed');
        }

        // 7. Update comment
        console.log('\n7. Updating comment...');
        const updatedComment = await commentService.updateComment(comment.id, user.id, {
            content: 'Updated comment content'
        });
        if (updatedComment && updatedComment.content === 'Updated comment content') {
            console.log('✅ Comment update verified');
        } else {
            console.error('❌ Comment update failed');
        }

        // 8. Delete comment
        console.log('\n8. Deleting comment...');
        await commentService.deleteComment(comment.id, user.id);
        const commentsAfterDelete = await commentService.getTaskComments(task.id);
        if (commentsAfterDelete.length === 0) {
            console.log('✅ Comment deletion verified');
        } else {
            console.error('❌ Comment deletion failed');
        }

        console.log('\n✨ Verification Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
};

verifyDay24();
