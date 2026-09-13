import { Route, Routes } from 'react-router';
import Landing from '@/pages/Landing';
import SignIn from '@/pages/SignIn';
import Identity from '@/pages/Register/Identity';
import Domain from '@/pages/Register/Domain';
import RunnerStep from '@/pages/Register/RunnerStep';
import Crew from '@/pages/Register/Crew';
import Pass from '@/pages/Register/Pass';
import StationLayout from '@/pages/Station/Layout';
import Platform from '@/pages/Station/Platform';
import Profile from '@/pages/Station/Profile';
import Team from '@/pages/Station/Team';
import Challenge from '@/pages/Station/Challenge';
import Submissions from '@/pages/Station/Submissions';
import Leaderboard from '@/pages/Station/Leaderboard';
import Announcements from '@/pages/Station/Announcements';
import EditRunner from '@/pages/Station/EditRunner';
import NotFound from '@/pages/NotFound';
import { RedirectIfSignedIn, RequireSession, RequireStep } from './guards';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<RedirectIfSignedIn />}>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register/identity" element={<Identity />} />
      </Route>

      <Route element={<RequireStep step="domain" />}>
        <Route path="/register/domain" element={<Domain />} />
      </Route>
      <Route element={<RequireStep step="runner" />}>
        <Route path="/register/runner" element={<RunnerStep />} />
      </Route>
      <Route element={<RequireStep step="crew" />}>
        <Route path="/register/crew" element={<Crew />} />
      </Route>
      <Route element={<RequireStep step="pass" />}>
        <Route path="/register/pass" element={<Pass />} />
      </Route>

      <Route element={<RequireSession />}>
        <Route path="/station" element={<StationLayout />}>
          <Route index element={<Platform />} />
          <Route path="profile" element={<Profile />} />
          <Route path="team" element={<Team />} />
          <Route path="challenge" element={<Challenge />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="runner" element={<EditRunner />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
