import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Community, User } from '../interfaces';
import "./UserCommunityRelationshipManager.css";
import { toast } from 'react-hot-toast';

interface MutationData {
    userId: string;
    communityId: string;
}

const UserCommunityRelationshipManager = () => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => axios.get('http://localhost:8080/user').then(res => res.data)
    });

    const { data: communities, isLoading: communitiesLoading } = useQuery({
        queryKey: ['communities'],
        queryFn: () => axios.get('http://localhost:8080/community').then(res => res.data)
    });

    const joinMutation = useMutation({
        mutationFn: (data: MutationData) => axios.post(`http://localhost:8080/user/${data.userId}/join/${data.communityId}`),
        onSuccess: (res: any) => {
            const successMessage = res.data?.message || 'Successfully joined the community';
            toast.success(successMessage);
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'An unknown error occurred';
            toast.error(`Error: ${errorMessage}`);
        }
    });
    const leaveMutation = useMutation({
        mutationFn: (data: MutationData) => axios.delete(`http://localhost:8080/user/${data.userId}/leave/${data.communityId}`),
        onSuccess: (res: any) => {
            const successMessage = res.data?.message || 'Successfully left the community';
            toast.success(successMessage);
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'An unknown error occurred';
            toast.error(`Error: ${errorMessage}`);
        }
    });

    const handleJoinClick = () => {
        if (selectedUser && selectedCommunity) {
            joinMutation.mutate({ userId: selectedUser, communityId: selectedCommunity });
        }
    };

    const handleLeaveClick = () => {
        if (selectedUser && selectedCommunity) {
            leaveMutation.mutate({ userId: selectedUser, communityId: selectedCommunity });
        }
    };

    if (usersLoading || communitiesLoading) return 'Loading...';

    // If not loading, we can sort users based on user.email

    const sortedUsers = (users || []).sort((a: User, b: User) => {
        if (a.email < b.email) return -1;
        if (a.email > b.email) return 1;
        return 0;
    });

    return (
        <div>
            <label>
                User: &nbsp;
                <select onChange={(e) => setSelectedUser(e.target.value)}>
                    <option value="">Select User</option>
                    {sortedUsers.map((user: User) => <option key={user._id} value={user._id}>{user.email}</option>)}
                </select>
            </label>

            <label>
                Community: &nbsp;
                <select onChange={(e) => setSelectedCommunity(e.target.value)}>
                    <option value="">Select Community</option>
                    {communities.map((community: Community) => <option key={community._id} value={community._id}>{community.name}</option>)}
                </select>
            </label>


            <button
                className="join-button"
                onClick={handleJoinClick}
                disabled={!selectedUser || !selectedCommunity}
            >
                Join
            </button>

            <button
                className="leave-button"
                onClick={handleLeaveClick}
                disabled={!selectedUser || !selectedCommunity}
            >
                Leave
            </button>
        </div>
    );
};

export default UserCommunityRelationshipManager;